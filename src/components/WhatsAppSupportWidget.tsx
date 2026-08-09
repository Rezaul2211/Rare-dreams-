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

  // Clean whatsapp phone number
  const getCleanWaNumber = () => {
    const raw = config.whatsappNumber || '+8801712345678';
    return raw.replace(/[^0-9]/g, '');
  };

  const handleOpenWhatsApp = (customText?: string) => {
    const textToSend = customText || waMessage || 'হ্যালো রেয়ার ড্রিমস! আপনাদের কালেকশন ও অর্ডার সংক্রান্ত সাহায্য প্রয়োজন।';
    const encoded = encodeURIComponent(textToSend);
    const waUrl = `https://wa.me/${getCleanWaNumber()}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

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
        text: data.reply || "আমাদের টিমের সাথে কথা বলতে সরাসরি হোয়াটসঅ্যাপ বাটনে চাপুন।",
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
    "বাচ্চার সঠিক সাইজ কিভাবে নির্বাচন করবো?",
    "পণ্য ৭ দিনের মধ্যে পরিবর্তন করার নিয়ম কি?"
  ];

  return (
    <>
      {/* FLOATING ACTION BUTTON - SLEEK, COMPACT, PREMIUM NO-PING */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white w-12 h-12 sm:w-13 sm:h-13 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center border border-emerald-400/30"
          aria-label="Toggle Customer Support Chat"
        >
          {isOpen ? (
            <X size={22} className="text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageCircle size={24} className="fill-white text-emerald-600" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-700"></span>
            </div>
          )}
        </button>
      </div>

      {/* POPUP CHAT WINDOW MODAL - CLEAN, LIGHTWEIGHT & PREMIUM */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-34 md:bottom-22 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[370px] bg-white rounded-2xl shadow-xl border border-neutral-200/90 overflow-hidden flex flex-col max-h-[520px] font-sans"
          >
            {/* WIDGET HEADER */}
            <div className="bg-neutral-900 text-white p-3.5 space-y-2.5 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  {mode === 'whatsapp' ? (
                    <MessageCircle size={18} className="fill-emerald-400" />
                  ) : (
                    <Sparkles size={18} className="text-amber-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-wide flex items-center gap-1 text-white">
                    <span>Rare Dreams Support</span>
                    <ShieldCheck size={13} className="text-emerald-400" />
                  </h3>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Online • Instant Care</span>
                  </p>
                </div>
              </div>

              {/* MODE TABS */}
              <div className="bg-neutral-800 p-0.5 rounded-xl flex items-center text-[11px] font-medium border border-neutral-700">
                <button
                  onClick={() => setMode('whatsapp')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    mode === 'whatsapp'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setMode('ai')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                    mode === 'ai'
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} className="text-amber-300" />
                  <span>AI Assistant</span>
                </button>
              </div>
            </div>

            {/* MODE 1: WHATSAPP DIRECT */}
            {mode === 'whatsapp' && (
              <div className="p-3.5 space-y-3.5 overflow-y-auto max-h-[380px] bg-white">
                <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-2.5 flex items-start space-x-2">
                  <Headphones size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-emerald-950">
                    <p className="font-bold">সরাসরি হোয়াটসঅ্যাপ সাহায্য</p>
                    <p className="text-[10px] text-emerald-700 leading-tight mt-0.5">
                      হেল্পলাইন: <span className="font-bold font-mono">{config.whatsappNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Templates: Clicking populates text into the box FIRST */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    প্রশ্ন নির্বাচন করুন (টেক্সট বক্সে জমা হবে):
                  </label>
                  <div className="grid grid-cols-1 gap-1">
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setWaMessage(tmpl);
                        }}
                        className={`text-[11px] font-medium border px-2.5 py-1.5 rounded-xl transition-all text-left flex items-center justify-between group ${
                          waMessage === tmpl
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200/80 text-neutral-700'
                        }`}
                      >
                        <span>{tmpl}</span>
                        <ChevronRight size={12} className="text-neutral-400 group-hover:text-emerald-600 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    আপনার প্রশ্নটি লিখুন / এডিট করুন:
                  </label>
                  <textarea
                    rows={3}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    placeholder="এখানে আপনার প্রশ্ন লিখুন বা উপরের অপশন সিলেক্ট করুন..."
                    className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none text-neutral-800"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <MessageCircle size={15} className="fill-white" />
                    <span>WhatsApp-এ মেসেজ পাঠান</span>
                    <ExternalLink size={13} />
                  </button>

                  <a
                    href={`tel:${config.whatsappNumber}`}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 text-center"
                  >
                    <Phone size={13} />
                    <span>কল করুন: {config.helplineNumber || config.whatsappNumber}</span>
                  </a>
                </div>
              </div>
            )}

            {/* MODE 2: AI ASSISTANT CHAT */}
            {mode === 'ai' && (
              <div className="flex flex-col h-[360px] bg-neutral-50">
                {/* Chat Messages */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-1.5 ${
                        msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-[10px] font-bold ${
                          msg.sender === 'user' ? 'bg-neutral-900' : 'bg-emerald-600'
                        }`}
                      >
                        {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                      </div>

                      <div
                        className={`max-w-[82%] rounded-xl p-2.5 space-y-0.5 ${
                          msg.sender === 'user'
                            ? 'bg-neutral-900 text-white'
                            : 'bg-white text-neutral-800 border border-neutral-200'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line text-[11px]">{msg.text}</p>
                        <p className={`text-[8px] text-right ${msg.sender === 'user' ? 'text-neutral-400' : 'text-neutral-400'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex items-center space-x-1.5 text-neutral-500 text-[11px] p-1">
                      <Sparkles size={13} className="animate-spin text-emerald-600" />
                      <span>এআই উত্তর তৈরি করছে...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* AI Quick Prompt Chips */}
                <div className="px-2.5 py-1.5 bg-white border-t border-neutral-200/80 flex items-center gap-1 overflow-x-auto scrollbar-none">
                  {["ডেলিভারি চার্জ?", "সাইজ গাইড", "রিটার্ন পলিসি"].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendAiMessage(undefined, chip)}
                      className="text-[10px] whitespace-nowrap bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 text-neutral-700 px-2 py-1 rounded-lg border border-neutral-200/60 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Switch to WhatsApp link */}
                <div className="px-3 py-1 bg-amber-50 border-t border-amber-100 flex items-center justify-between text-[10px] font-medium text-amber-900">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={11} className="text-amber-600 shrink-0" />
                    সহায়তা প্রয়োজন?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const lastUserMsg = [...chatMessages].reverse().find(m => m.sender === 'user')?.text || '';
                      setWaMessage(lastUserMsg);
                      setMode('whatsapp');
                    }}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>হোয়াটসঅ্যাপে যান</span>
                    <ExternalLink size={9} />
                  </button>
                </div>

                {/* AI Chat Input Form */}
                <form onSubmit={handleSendAiMessage} className="p-2 bg-white border-t border-neutral-200 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="প্রশ্নটি লিখুন..."
                    className="flex-1 text-xs bg-neutral-100 border border-neutral-200 px-2.5 py-2 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-neutral-800"
                  />
                  <button
                    type="submit"
                    disabled={!aiInput.trim() || aiLoading}
                    className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  >
                    <Send size={14} />
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
