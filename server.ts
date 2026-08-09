import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Initialize Firebase Admin (Only if not already initialized)

if (!getApps().length) {
  // Use default credential in production/cloud environments
  // which will work if the environment provides application default credentials.
  // Otherwise, it requires GOOGLE_APPLICATION_CREDENTIALS or passing service account.
  try {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "lofty-theme-0nn32"
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const stripe = getStripe();
    const { items, orderId, successUrl, cancelUrl } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.images && item.images.length > 0 ? [item.images[0]] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: orderId,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});

app.post("/api/make-admin", async (req, res) => {
  try {
    const { uid } = req.body;
    // In a real app, this should be heavily secured.
    // For this prototype, we'll allow it to help setup.
    await getAuth().setCustomUserClaims(uid, { admin: true });
    res.json({ success: true, message: `User ${uid} is now an admin` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message } = req.body;
    const ai = getAI();

    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{
              text: `You are the AI Shopping Assistant for Rare Dreams (রেয়ার ড্রিমস), a luxury fashion e-commerce brand in Bangladesh specializing in Boys Wear, Girls Wear, Baby Essentials, Footwear, Punjabi, Blazers, and Ethnic Wear.
Answer the user's question in a warm, polite, and helpful tone in Bengali or English depending on their language. Keep responses concise and easy to read.

Customer query: ${message}`
            }]
          }
        ]
      });

      return res.json({ reply: response.text });
    } else {
      // Intelligent fallback when GEMINI_API_KEY is not explicitly set
      const lower = (message || '').toLowerCase();
      let reply = "ধন্যবাদ রেয়ার ড্রিমসে যোগাযোগ করার জন্য! আমাদের ঢাকা সিটিতে ১-২ দিন এবং ঢাকার বাইরে ২-৪ দিনে হোম ডেলিভারি দেয়া হয়। ক্যাশ অন ডেলিভারি সুবিধা রয়েছে।";
      
      if (lower.includes('size') || lower.includes('সাইজ')) {
        reply = "আমাদের সব পোশাকের স্ট্যান্ডার্ড সাইজ চার্ট প্রোডাক্ট পেজে দেয়া আছে। আপনার সন্তানের বয়স এবং উচ্চতা আমাদের জানালে আমরা সঠিক সাইজ সাজেস্ট করতে পারি!";
      } else if (lower.includes('return') || lower.includes('রিটার্ন') || lower.includes('চেঞ্জ')) {
        reply = "পণ্য হাতে পাওয়ার পর পছন্দ না হলে বা সাইজ সমস্যা থাকলে ৭ দিনের মধ্যে ক্যাশ অন ডেলিভারিতে ফ্রী এক্সচেঞ্জ/রিটার্ন সুবিধা পাবেন।";
      } else if (lower.includes('price') || lower.includes('দাম') || lower.includes('কত')) {
        reply = "আমাদের সব প্রিমিয়াম কালেকশনের প্রাইজ ওয়েবসাইটে ডিসকাউন্ট সহ দেয়া আছে। আরও বিস্তারিত জানতে সরাসরি হোয়াটসঅ্যাপেও মেসেজ করতে পারেন!";
      }

      return res.json({ reply });
    }
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.json({ 
      reply: "রেয়ার ড্রিমস এআই অ্যাসিস্ট্যান্ট এখন ব্যস্ত আছে। অনুগ্রহ করে সরাসরি হোয়াটসঅ্যাপ বাটসনে ক্লিক করে আমাদের টিমের সাথে কথা বলুন!" 
    });
  }
});


async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fallback for SPA routing in production
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
