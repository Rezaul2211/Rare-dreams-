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
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
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
  const { message } = req.body;
  const lower = (message || '').toLowerCase();

  // Helper for smart Bengali knowledge base responses
  const getSmartFallback = (query: string) => {
    if (query.includes('size') || query.includes('সাইজ')) {
      return "আমাদের প্রতিটি পোশাকের সঙ্গে একুরেট সাইজ চার্ট দেয়া আছে। বাচ্চার বর্তমান বয়স ও উচ্চতা জানালে আমরা সঠিক সাইজ সিলেক্টে সাহায্য করতে পারি!";
    } else if (query.includes('return') || query.includes('রিটার্ন') || query.includes('চেঞ্জ') || query.includes('বদলা')) {
      return "পণ্য হাতে পাওয়ার পর পছন্দ না হলে বা সাইজ সমস্যা থাকলে ৭ দিনের সহজ ফ্রি রিপ্লেসমেন্ট গ্যারান্টি পাবেন।";
    } else if (query.includes('price') || query.includes('দাম') || query.includes('কত') || query.includes('টাকা')) {
      return "আমাদের বয়েজ, গার্লস ও বেবি কালেকশনের দাম ওয়েবসাইটে ডিসকাউন্ট সহ দেখানো আছে। যেকোনো প্রশ্ন থাকলে সরাসরি হোয়াটসঅ্যাপেও মেসেজ করতে পারেন!";
    } else if (query.includes('delivery') || query.includes('ডেলিভারি') || query.includes('চার্জ')) {
      return "ঢাকা সিটিতে ১-২ দিন (চার্জ ৳৬০) এবং ঢাকার বাইরে ২-৪ দিনে (চার্জ ৳১২০) ক্যাশ অন ডেলিভারিতে প্রিমিয়াম ড্রেস পাঠানো হয়। ২০০০ টাকার উপরে অর্ডারে ডেলিভারি ফ্রী!";
    } else if (query.includes('location') || query.includes('শো-রুম') || query.includes('ঠিকানা') || query.includes('address')) {
      return "আমাদের শো-রুম / অফিস ঠিকানা: লেভেল ৪, ব্লক বি, যমুনা ফিউচার পার্ক, ঢাকা। ট্রেড লাইসেন্স নং: TRAD/DNCC/012984/2026।";
    }
    return "ধন্যবাদ রেয়ার ড্রিমসে (Rare Dreams) যোগাযোগ করার জন্য! আমাদের ঢাকা সিটিতে ১-২ দিন এবং ঢাকার বাইরে ২-৪ দিনে ক্যাশ অন ডেলিভারিতে প্রিমিয়াম পোশাক পাঠানো হয়। ২০০০ টাকার উপরে অর্ডারে ডেলিভারি ফ্রী!";
  };

  try {
    const ai = getAI();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [{
                text: message || "Hello"
              }]
            }
          ],
          config: {
            systemInstruction: `You are the official AI Shopping Consultant & Customer Care Specialist for "Rare Dreams" (রেয়ার ড্রিমস), the premier luxury fashion e-commerce brand for kids and family in Bangladesh.

WEBSITE & STORE KNOWLEDGE BASE:
1. BRAND OVERVIEW:
   - Name: Rare Dreams (রেয়ার ড্রিমস)
   - Specialty: High-end luxury clothing and footwear for Boys, Girls, Babies, and Family.
   - Tagline: Luxury Elegance for Every Special Moment.

2. PRODUCT CATALOG:
   - Boys Wear: Premium Panjabi & Pajama sets, Kabli suit, Sherwani, Blazers, Formal Suits, Shirts, T-Shirts, Trousers & Jeans.
   - Girls Wear: Designer Lehenga, Party Gowns, Frocks, Salwar Kameez, Anarkali dresses, Tops & Skirts.
   - Baby Essentials: Newborn gift boxes, Rompers, Onesies, Soft cotton sleepsuits, Baby blankets & bibs.
   - Footwear: Genuine leather shoes, Formal loafers, Party sandals, Casual sneakers for boys and girls.

3. SHIPPING & DELIVERY POLICY:
   - Inside Dhaka: 1 - 2 business days. Delivery fee ৳60. FREE SHIPPING on orders over ৳2,000!
   - Outside Dhaka: 2 - 4 business days. Delivery fee ৳120. FREE SHIPPING on orders over ৳2,000!
   - Cash on Delivery (COD): Available all over Bangladesh. Delivery agent allows checking the package upon delivery.

4. RETURN & REPLACEMENT POLICY:
   - 7 Days Free Replacement & Return Guarantee for size issues, quality mismatch, or manufacturing defect.
   - Tags and original packaging must be intact.

5. PAYMENT OPTIONS:
   - Cash on Delivery (COD)
   - Mobile Banking: bKash, Nagad, Rocket
   - Credit/Debit Cards: Visa, MasterCard

6. OFFICIAL VERIFICATION & LOCATION:
   - Trade License: TRAD/DNCC/012984/2026
   - DBID ID: DBID-2026-884129
   - Showroom / Office: Level 4, Block B, Jamuna Future Park, Dhaka, Bangladesh.

INSTRUCTIONS:
- Answer warm, politely and concisely. Use natural Bengali (or English if customer asks in English).
- Recommend products, explain delivery charges, size guides, or returns smoothly.
- Keep responses short, clean, and well-structured.`
          }
        });

        if (response && response.text) {
          return res.json({ reply: response.text });
        }
      } catch (geminiError: any) {
        // Silently fallback if GEMINI_API_KEY is not set or invalid in this environment
      }
    }

    return res.json({ reply: getSmartFallback(lower) });
  } catch (error: any) {
    console.error("AI Chat route error:", error);
    return res.json({ reply: getSmartFallback(lower) });
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
