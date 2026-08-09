import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  Brain
} from 'lucide-react';
import { useStoreConfigStore } from '../store/useStoreConfigStore';

interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function WhatsAppSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'whatsapp' | 'ai'>('whatsapp');
  
  // WhatsApp Message State
  const [waText, setWaText] = useState('');

  // AI Chat States
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'হ্যালো! রেয়ার ড্রিমস (Rare Dreams) এআই কাস্টমার কেয়ারে আপনাকে স্বাগতম। সাইজ, ডেলিভারি বা পোশাক সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { config, fetchConfig } = useStoreConfigStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (isOpen && mode === 'ai') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, mode, chatMessages, aiLoading]);

  // Clean WhatsApp phone number
  const getCleanWaNumber = () => {
    const raw = config.whatsappNumber || '+8801712345678';
    return raw.replace(/[^0-9]/g, '');
  };

  // Open WhatsApp with direct text
  const handleOpenWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalMsg = waText.trim() || 'হ্যালো রেয়ার ড্রিমস! আপনাদের কালেকশন ও অর্ডার সম্পর্কে সাহায্য চাই।';
    const encoded = encodeURIComponent(finalMsg);
    const waUrl = `https://wa.me/${getCleanWaNumber()}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  // Send AI Message with Gemini
  const handleSendAiMessage = async (e?: React.FormEvent, directText?: string) => {
    if (e) e.preventDefault();
    const query = (directText || aiInput).trim();
    if (!query || aiLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: now
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!directText) setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();

      const aiMsg: ChatMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.reply || "আমাদের কাস্টমার টিমের সাথে সরাসরি কথা বলতে হোয়াটসঅ্যাপ ট্যাবে মেসেজ করুন।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI chat error:", err);
      const fallbackMsg: ChatMsg = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: 'অনুগ্রহ করে সরাসরি হোয়াটসঅ্যাপ ট্যাবে গিয়ে আমাদের টিমের সাথে কথা বলুন!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const QUICK_TEMPLATES = [
    "ক্যাশ অন ডেলিভারি কি এভেলেবল আছে?",
    "ডেলিভারি চার্জ কত টাকা?",
    "বাচ্চার সঠিক সাইজ কিভাবে নির্বাচন করবো?",
    "পণ্য ৭ দিনের মধ্যে পরিবর্তন করার নিয়ম কি?"
  ];

  return (
    <>
      {/* COMPACT & SLEEK FLOATING BUTTON */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-neutral-900 hover:bg-black text-white w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center border border-neutral-700/60"
          aria-label="Toggle Customer Support Chat"
        >
          {isOpen ? (
            <X size={20} className="text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageCircle size={22} className="fill-emerald-400 text-emerald-400" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
          )}
        </button>
      </div>

      {/* ULTRA-COMPACT, PREMIUM CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="fixed bottom-33 md:bottom-20 right-3 sm:right-6 z-50 w-[310px] sm:w-[330px] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col font-sans"
          >
            {/* WIDGET HEADER */}
            <div className="bg-neutral-900 text-white px-3.5 py-3 relative border-b border-neutral-800">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 transition-colors"
              >
                <X size={15} />
              </button>

              <div className="flex items-center space-x-2.5 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  {mode === 'whatsapp' ? (
                    <MessageCircle size={15} className="fill-emerald-400" />
                  ) : (
                    <Sparkles size={15} className="text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-[12px] font-extrabold tracking-tight flex items-center gap-1 text-white">
                    <span>Rare Dreams Support</span>
                    <ShieldCheck size={12} className="text-emerald-400" />
                  </h3>
                  <p className="text-[9px] text-neutral-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online • Fast Response</span>
                  </p>
                </div>
              </div>

              {/* MODE SWITCHER TABS */}
              <div className="bg-neutral-800/90 p-0.5 rounded-lg flex items-center text-[10px] font-semibold border border-neutral-700/80">
                <button
                  onClick={() => setMode('whatsapp')}
                  className={`flex-1 py-1 rounded-md flex items-center justify-center space-x-1 transition-all ${
                    mode === 'whatsapp'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <MessageCircle size={12} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 py-1 rounded-md flex items-center justify-center space-x-1 transition-all ${
                    mode === 'ai'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={12} className="text-amber-300" />
                  <span>AI Assistant</span>
                </button>
              </div>
            </div>

            {/* TAB 1: WHATSAPP DIRECT CHAT */}
            {mode === 'whatsapp' && (
              <div className="p-3 bg-white space-y-3">
                {/* Quick Templates */}
                <div>
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                    প্রশ্ন নির্বাচন করুন (টেক্সট বক্সে জমা হবে):
                  </label>
                  <div className="space-y-1">
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setWaText(tmpl)}
                        className={`w-full text-left text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all flex items-center justify-between ${
                          waText === tmpl
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-700'
                        }`}
                      >
                        <span className="truncate pr-1">{tmpl}</span>
                        <ChevronRight size={11} className="text-neutral-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea + Integrated Direct Send Button */}
                <form onSubmit={handleOpenWhatsApp} className="space-y-2 pt-1 border-t border-neutral-100">
                  <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                    আপনার মেসেজ লিখুন বা এডিট করুন:
                  </label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      value={waText}
                      onChange={(e) => setWaText(e.target.value)}
                      placeholder="এখানে লিখুন..."
                      className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 pr-10 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none text-neutral-800"
                    />
                    <button
                      type="submit"
                      title="Send to WhatsApp"
                      className="absolute bottom-2 right-2 w-7 h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                  <p className="text-[9px] text-neutral-400 text-center">
                    বাটন এ চাপলে সরাসরি হোয়াটসঅ্যাপ অ্যাপ খুলবে।
                  </p>
                </form>
              </div>
            )}

            {/* TAB 2: AI ASSISTANT CHAT */}
            {mode === 'ai' && (
              <div className="flex flex-col h-[320px] bg-neutral-50">
                {/* Chat Messages Area */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2 text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-1.5 ${
                        msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-[9px] font-bold ${
                          msg.sender === 'user' ? 'bg-neutral-900' : 'bg-emerald-600'
                        }`}
                      >
                        {msg.sender === 'user' ? <User size={10} /> : <Bot size={10} />}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-xl px-2.5 py-1.5 ${
                          msg.sender === 'user'
                            ? 'bg-neutral-900 text-white rounded-tr-none'
                            : 'bg-white text-neutral-800 border border-neutral-200/90 shadow-2xs rounded-tl-none'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line text-[10.5px]">{msg.text}</p>
                        <p className={`text-[7.5px] text-right mt-0.5 ${msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* THINKING ANIMATION STATE */}
                  {aiLoading && (
                    <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-2.5 py-1.5 max-w-[80%] text-[10px]">
                      <div className="relative flex items-center justify-center shrink-0">
                        <Brain size={13} className="text-emerald-600 animate-pulse" />
                      </div>
                      <div className="flex items-center space-x-1 font-medium">
                        <span>চিন্তা করা হচ্ছে</span>
                        <span className="flex space-x-0.5 ml-1">
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce"></span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="px-2 py-1 bg-white border-t border-neutral-200/60 flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {["ডেলিভারি চার্জ?", "সাইজ চার্ট", "রিটার্ন সুবিধা"].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAiMessage(undefined, chip)}
                      className="text-[9.5px] whitespace-nowrap bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-neutral-700 px-2 py-0.5 rounded-md border border-neutral-200/60 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Footer Link to WhatsApp if human care needed */}
                <div className="px-2.5 py-1 bg-emerald-50/60 border-t border-emerald-100 flex items-center justify-between text-[9px] font-medium text-emerald-950">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={10} className="text-emerald-600 shrink-0" />
                    সরাসরি হিউম্যান সাপোর্ট চান?
                  </span>
                  <button
                    type="button"
                    onClick={() => setMode('whatsapp')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    হোয়াটসঅ্যাপে যান →
                  </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendAiMessage} className="p-1.5 bg-white border-t border-neutral-200 flex items-center gap-1">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="এখানে প্রশ্নটি লিখুন..."
                    className="flex-1 text-[11px] bg-neutral-100 border border-neutral-200 px-2.5 py-1.5 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-neutral-800"
                  />
                  <button
                    type="submit"
                    disabled={!aiInput.trim() || aiLoading}
                    className="w-7 h-7 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
