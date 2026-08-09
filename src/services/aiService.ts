/**
 * AI Service for Rare Dreams Customer Support Chat
 * Supports Groq API (Llama 3.3 70B), Gemini API, and Smart Local Fallback.
 * Ensures smooth thinking animation state and robust error handling.
 */

export interface AiChatResponse {
  reply: string;
  provider?: 'groq' | 'gemini' | 'fallback';
  error?: string;
}

export interface SendMessageOptions {
  message: string;
  minThinkingMs?: number; // Minimum duration for thinking animation (default: 1200ms)
}

/**
 * Send user prompt to the backend AI endpoint (/api/ai-chat).
 * Handles API fetch, thinking state timing, and error resilience.
 */
export async function sendAiMessage({
  message,
  minThinkingMs = 1200
}: SendMessageOptions): Promise<AiChatResponse> {
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      reply: "অনুগ্রহ করে আপনার প্রশ্নটি লিখুন।",
      provider: 'fallback'
    };
  }

  // Promise for artificial minimum delay to showcase thinking state smoothly
  const delayPromise = new Promise(resolve => setTimeout(resolve, minThinkingMs));

  // Request to API endpoint (/api/ai-chat)
  const apiPromise = (async (): Promise<AiChatResponse> => {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Invalid JSON structure received from AI API');
      }

      return {
        reply: data.reply,
        provider: data.provider || 'groq'
      };
    } catch (err: any) {
      console.warn("AI Service API Fetch warning:", err?.message || err);
      // Client-side fallback if server is unreachable
      return {
        reply: getClientSmartFallback(trimmed),
        provider: 'fallback',
        error: err?.message
      };
    }
  })();

  // Wait for both API response and minimum thinking timer
  const [result] = await Promise.all([apiPromise, delayPromise]);
  return result;
}

/**
 * Smart Bengali client-side fallback knowledge base
 * Used when network or server is offline
 */
function getClientSmartFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('তুমি কে') || q.includes('কে তুমি') || q.includes('who are you') || q.includes('identity')) {
    return "আমি রেয়ার ড্রিমস (Rare Dreams) এর অফিশিয়াল এআই অ্যাসিস্ট্যান্ট & পার্সোনাল শপিং কনসালট্যান্ট! 🌟\n\nআমি আপনাকে বাচ্চার পোশাকের সাইজ সিলেক্ট, লেটেস্ট কালেকশন, ডেলিভারি বা প্রোডাক্ট সংক্রান্ত যেকোনো প্রশ্নে সাহায্য করতে পারি।";
  } else if (q.includes('হাই') || q.includes('হ্যালো') || q.includes('hello') || q.includes('hi') || q.includes('সালাম')) {
    return "আসসালামু আলাইকুম! রেয়ার ড্রিমসে (Rare Dreams) আপনাকে স্বাগতম। 🌸\n\nআজকে আপনাকে কীভাবে সাহায্য করতে পারি? যেকোনো প্রোডাক্ট, সাইজ বা ডেলিভারি সম্পর্কে জানতে আমাকে বলুন!";
  } else if (q.includes(' size') || q.includes('সাইজ') || q.includes('মাপ')) {
    return "আমাদের প্রতিটি পোশাকের সঙ্গে একুরেট সাইজ চার্ট দেয়া আছে। বাচ্চার বর্তমান বয়স ও উচ্চতা জানালে আমরা সঠিক সাইজ সিলেক্টে সাহায্য করবো!";
  } else if (q.includes('return') || q.includes('রিটার্ন') || q.includes('চেঞ্জ') || q.includes('বদলা')) {
    return "পণ্য হাতে পাওয়ার পর পছন্দ না হলে বা সাইজ না মিললে ৭ দিনের সহজ ও ফ্রি রিপ্লেসমেন্ট গ্যারান্টি পাবেন!";
  } else if (q.includes('delivery') || q.includes('ডেলিভারি') || q.includes('চার্জ')) {
    return "ঢাকা সিটিতে ১-২ দিন (চার্জ ৳৬০) এবং ঢাকার বাইরে ২-৪ দিনে (চার্জ ৳১২০) ক্যাশ অন ডেলিভারিতে প্রিমিয়াম ড্রেস পাঠানো হয়। ২০০০ টাকার উপরে অর্ডারে ডেলিভারি ফ্রী! 🚚";
  } else if (q.includes('location') || q.includes('শো-রুম') || q.includes('ঠিকানা')) {
    return "আমাদের শো-রুম / অফিস ঠিকানা: লেভেল ৪, ব্লক বি, যমুনা ফিউচার পার্ক, ঢাকা। ট্রেড লাইসেন্স নং: TRAD/DNCC/012984/2026।";
  }

  return "ধন্যবাদ রেয়ার ড্রিমসে (Rare Dreams) যোগাযোগ করার জন্য! আমাদের কালেকশন, ডেলিভারি বা অর্ডারে যেকোনো সহযোগিতার জন্য সরাসরি হোয়াটসঅ্যাপেও মেসেজ করতে পারেন।";
}
