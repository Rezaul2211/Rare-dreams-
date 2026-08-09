import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  Sparkles, 
  X, 
  Send, 
  Phone, 
  ExternalLink, 
  Bot, 
  User, 
  CheckCheck, 
  Headphones, 
  ShieldCheck,
  ChevronRight,
  HelpCircle
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
  const [waMessage, setWaMessage] = useState('');
  
  // AI Chat States
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'হ্যালো! রেয়ার ড্রিমস (Rare Dreams) এআই অ্যাসিস্ট্যান্ট-এ আপনাকে স্বাগতম। সাইজ, ডেলিভারি বা প্রোডাক্ট নিয়ে যেকোনো প্রশ্ন করুন!',
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
  }, [isOpen, mode, chatMessages]);

  // Format clean whatsapp phone number (e.g., remove spaces and symbols)
  const getCleanWaNumber = () => {
    const raw = config.whatsappNumber || '+8801712345678';
    return raw.replace(/[^0-9]/g, '');
  };

  const handleOpenWhatsApp = (customText?: string) => {
    const textToSend = customText || waMessage || 'Hi Rare Dreams, I need help with an order/product.';
    const encoded = encodeURIComponent(textToSend);
    const waUrl = `https://wa.me/${getCleanWaNumber()}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userText = aiInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: now
    };

    setChatMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();

      const aiMsg: ChatMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.reply || "আমাদের টিমের সাথে কথা বলতে নিচের 'হোয়াটসঅ্যাপে পাঠান' বাটনটি চাপুন।",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI chat error:", err);
      const fallbackMsg: ChatMsg = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: 'সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করতে নিচের বাটনে ক্লিক করুন!',
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
    "সাইজ কনফিউশনে সঠিক সাইজ লাগবে",
    "পণ্য ৭ দিনের মধ্যে পরিবর্তন করার নিয়ম কি?"
  ];

  return (
    <>
      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-white/80"
          aria-label="Contact WhatsApp Support or AI Assistant"
        >
          {/* Subtle glowing ring pulse */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping opacity-75"></span>

          <div className="relative flex items-center space-x-2">
            {isOpen ? (
              <X size={24} className="transition-transform duration-200 rotate-90" />
            ) : (
              <>
                <MessageCircle size={26} className="fill-white text-emerald-600" />
                <span className="hidden sm:inline-block text-xs font-black tracking-wide pr-1 uppercase">
                  Support & AI
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-600 animate-pulse"></span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* POPUP CHAT WINDOW MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-36 md:bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[380px] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[560px] font-sans"
          >
            {/* WIDGET HEADER */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 space-y-3 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3.5 right-3.5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  {mode === 'whatsapp' ? (
                    <MessageCircle size={22} className="fill-white" />
                  ) : (
                    <Sparkles size={22} className="text-amber-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                    <span>Rare Dreams Customer Care</span>
                    <ShieldCheck size={14} className="text-emerald-300" />
                  </h3>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    <span>Online 24/7 • Fast Response</span>
                  </p>
                </div>
              </div>

              {/* MODE SWITCHER TABS (MODEL SWITCHER STYLE) */}
              <div className="bg-black/20 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold border border-white/10">
                <button
                  onClick={() => setMode('whatsapp')}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                    mode === 'whatsapp'
                      ? 'bg-white text-emerald-800 shadow-md scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp Chat</span>
                </button>

                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 py-1.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                    mode === 'ai'
                      ? 'bg-white text-teal-900 shadow-md scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>AI Assistant</span>
                </button>
              </div>
            </div>

            {/* BODY MODE 1: WHATSAPP DIRECT */}
            {mode === 'whatsapp' && (
              <div className="p-4 space-y-4 overflow-y-auto max-h-[400px] bg-neutral-50/50">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-start space-x-2.5">
                  <Headphones size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950">
                    <p className="font-bold">সরাসরি হোয়াটসঅ্যাপে মেসেজ করুন</p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                      আমাদের হেল্পলাইন নাম্বার: <span className="font-bold font-mono">{config.whatsappNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Templates */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    দ্রুত প্রশ্ন সিলেক্ট করুন:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setWaMessage(tmpl);
                          handleOpenWhatsApp(tmpl);
                        }}
                        className="text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-neutral-200 text-neutral-700 px-2.5 py-1.5 rounded-xl transition-all text-left flex items-center gap-1 group shadow-2xs"
                      >
                        <span>{tmpl}</span>
                        <ChevronRight size={12} className="text-neutral-400 group-hover:text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message Input Area */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    বা আপনার প্রশ্ন লিখুন:
                  </label>
                  <textarea
                    rows={3}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="যেমন: সাইজ ১০ বছর বাচ্চার জন্য কনফিডেন্টলি কি নেব? অথবা ছবি পাঠাতে চাই..."
                    className="w-full text-xs bg-white border border-neutral-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => handleOpenWhatsApp()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <MessageCircle size={16} className="fill-white" />
                    <span>WhatsApp-এ মেসেজ পাঠান</span>
                    <ExternalLink size={14} />
                  </button>

                  <a
                    href={`tel:${config.whatsappNumber}`}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2.5 rounded-2xl transition-all flex items-center justify-center space-x-2 text-center"
                  >
                    <Phone size={14} />
                    <span>কল করুন: {config.helplineNumber || config.whatsappNumber}</span>
                  </a>
                </div>
              </div>
            )}

            {/* BODY MODE 2: AI ASSISTANT CHAT */}
            {mode === 'ai' && (
              <div className="flex flex-col h-[380px] bg-neutral-50">
                {/* Chat Messages */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${
                        msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
                          msg.sender === 'user' ? 'bg-neutral-900' : 'bg-teal-600'
                        }`}
                      >
                        {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                      </div>

                      <div
                        className={`max-w-[80%] rounded-2xl p-3 shadow-2xs space-y-1 ${
                          msg.sender === 'user'
                            ? 'bg-neutral-900 text-white rounded-tr-xs'
                            : 'bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-xs'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                        <p className={`text-[9px] text-right ${msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex items-center space-x-2 text-neutral-400 text-xs italic p-2">
                      <Sparkles size={14} className="animate-spin text-teal-600" />
                      <span>Rare Dreams AI চিন্তা করছে...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Transfer to WhatsApp link inside AI mode */}
                <div className="px-3 py-1 bg-amber-50 border-t border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={12} className="text-amber-600" />
                    ম্যাসেজে সমস্যার সমাধান না হলে?
                  </span>
                  <button
                    onClick={() => {
                      const lastUserMsg = [...chatMessages].reverse().find(m => m.sender === 'user')?.text || '';
                      handleOpenWhatsApp(lastUserMsg);
                    }}
                    className="text-emerald-700 hover:underline flex items-center gap-0.5 text-[11px]"
                  >
                    <span>হোয়াটসঅ্যাপে হিউম্যান এজেন্টে সুইচ করুন</span>
                    <ExternalLink size={10} />
                  </button>
                </div>

                {/* AI Chat Input */}
                <form onSubmit={handleSendAiMessage} className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="পোশাকের সাইজ বা ডেলিভারি নিয়ে লিখুন..."
                    className="flex-1 text-xs bg-neutral-100 border border-neutral-200 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={!aiInput.trim() || aiLoading}
                    className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Send size={15} />
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
