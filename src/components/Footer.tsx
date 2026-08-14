import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Send,
  ShoppingBag,
  Headphones,
  Info,
  Layers
} from 'lucide-react';
import { useStoreConfigStore } from '../store/useStoreConfigStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useLanguageStore, translateCategory } from '../store/useLanguageStore';
import PolicyModal from './PolicyModal';
import Logo from './Logo';

export default function Footer() {
  const { config } = useStoreConfigStore();
  const { categories } = useCategoryStore();
  const { language, t } = useLanguageStore();
  const [activePolicyModal, setActivePolicyModal] = useState<'returns' | 'privacy' | 'terms' | 'license' | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-neutral-900 text-white pt-16 pb-20 md:pb-12 mt-auto border-t border-neutral-800 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* TOP SECTION: BRAND & NEWSLETTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
            
            {/* Brand Info & Social */}
            <div className="space-y-6">
              <Link to="/" onClick={scrollToTop} className="inline-block hover:opacity-90 transition-opacity">
                <Logo variant="dark" size="lg" showText={true} />
              </Link>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-sm">
                Your trusted brand for exclusive fashion for men, women & kids. Style that defines you.
              </p>
              
              {/* Social Icons */}
              <div className="flex items-center space-x-4">
                {/* Facebook */}
                <a 
                  href={config.facebookUrl || "https://facebook.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-neutral-500 hover:text-white text-neutral-400 flex items-center justify-center transition-all"
                  title="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a 
                  href={config.instagramUrl || "https://instagram.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-neutral-500 hover:text-white text-neutral-400 flex items-center justify-center transition-all"
                  title="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a 
                  href={config.tiktokUrl || "https://tiktok.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-neutral-500 hover:text-white text-neutral-400 flex items-center justify-center transition-all"
                  title="TikTok"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                
                {/* YouTube */}
                <a 
                  href={config.youtubeUrl || "https://youtube.com"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 hover:border-neutral-500 hover:text-white text-neutral-400 flex items-center justify-center transition-all"
                  title="YouTube"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Newsletter Card */}
            <div className="bg-neutral-800/80 rounded-3xl p-6 sm:p-8 border border-neutral-700/50 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:border-neutral-600 transition-colors">
              <div className="relative z-10 space-y-4">
                <h3 className="text-[#C69A4C] font-bold tracking-widest text-xs sm:text-sm uppercase">STAY IN THE LOOP</h3>
                <p className="text-neutral-300 text-sm">Subscribe to get special offers, new arrivals & more.</p>
                <form onSubmit={handleSubscribe} className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter your email" 
                      className="w-full bg-[#1A1A1A] border border-neutral-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C69A4C] transition-colors" 
                    />
                    <button 
                      type="submit" 
                      className="bg-[#C69A4C] hover:bg-[#B38A40] text-white rounded-xl px-6 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors sm:w-auto w-full shrink-0"
                    >
                      SUBSCRIBE <Send size={16} />
                    </button>
                  </div>
                  {subscribed && (
                    <p className="text-xs text-[#C69A4C] pt-1">Thank you for subscribing!</p>
                  )}
                </form>
              </div>
            </div>

          </div>

          {/* MIDDLE SECTION: LINKS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-neutral-800">
            {/* SHOP */}
            <div className="space-y-5">
               <h4 className="text-pink-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <ShoppingBag size={14} className="text-pink-500/70" /> SHOP
               </h4>
               <ul className="space-y-3.5 text-sm text-neutral-400">
                 {categories.slice(0, 4).map((cat, idx) => (
                    <li key={cat.id || idx}>
                      <Link to={cat.link || `/category/${encodeURIComponent(cat.title)}`} onClick={scrollToTop} className="hover:text-white transition-colors">
                        {translateCategory(cat.title, language)}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/shop" onClick={scrollToTop} className="hover:text-white transition-colors">New Arrivals</Link>
                  </li>
                  <li>
                    <Link to="/shop" onClick={scrollToTop} className="hover:text-white transition-colors">Sale</Link>
                  </li>
               </ul>
            </div>

            {/* CUSTOMER SERVICE */}
            <div className="space-y-5">
               <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Headphones size={14} className="text-emerald-500/70" /> CUSTOMER SERVICE
               </h4>
               <ul className="space-y-3.5 text-sm text-neutral-400">
                  <li>
                    <Link to="/contact" onClick={scrollToTop} className="hover:text-white transition-colors">Contact Us</Link>
                  </li>
                  <li>
                    <Link to="/account" onClick={scrollToTop} className="hover:text-white transition-colors">Order Tracking</Link>
                  </li>
                  <li>
                    <button onClick={() => setActivePolicyModal('returns')} className="hover:text-white transition-colors text-left w-full">Returns & Refunds</button>
                  </li>
                  <li>
                    <Link to="/shipping" onClick={scrollToTop} className="hover:text-white transition-colors">Shipping Information</Link>
                  </li>
                  <li>
                    <Link to="/size-guide" onClick={scrollToTop} className="hover:text-white transition-colors">Size Guide</Link>
                  </li>
                  <li>
                    <Link to="/faq" onClick={scrollToTop} className="hover:text-white transition-colors">FAQ</Link>
                  </li>
               </ul>
            </div>

            {/* ABOUT US */}
            <div className="space-y-5">
               <h4 className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Info size={14} className="text-purple-500/70" /> ABOUT US
               </h4>
               <ul className="space-y-3.5 text-sm text-neutral-400">
                  <li>
                    <Link to="/about" onClick={scrollToTop} className="hover:text-white transition-colors">About Rare Dreams</Link>
                  </li>
                  <li>
                    <Link to="/story" onClick={scrollToTop} className="hover:text-white transition-colors">Our Story</Link>
                  </li>
                  <li>
                    <button onClick={() => setActivePolicyModal('privacy')} className="hover:text-white transition-colors text-left w-full">Privacy Policy</button>
                  </li>
                  <li>
                    <button onClick={() => setActivePolicyModal('terms')} className="hover:text-white transition-colors text-left w-full">Terms & Conditions</button>
                  </li>
                  <li>
                    <Link to="/blog" onClick={scrollToTop} className="hover:text-white transition-colors">Blog</Link>
                  </li>
                  <li>
                    <Link to="/careers" onClick={scrollToTop} className="hover:text-white transition-colors">Careers</Link>
                  </li>
               </ul>
            </div>

            {/* OTHER */}
            <div className="space-y-5">
               <h4 className="text-orange-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Layers size={14} className="text-orange-500/70" /> OTHER
               </h4>
               <ul className="space-y-3.5 text-sm text-neutral-400">
                  <li>
                    <button onClick={() => setActivePolicyModal('license')} className="hover:text-white transition-colors text-left w-full flex items-center gap-1.5">
                      Trade License
                    </button>
                  </li>
                  <li>
                    <button onClick={() => setActivePolicyModal('license')} className="hover:text-white transition-colors text-left w-full">
                      Verify License
                    </button>
                  </li>
                  <li>
                    <Link to="/account" onClick={scrollToTop} className="hover:text-white transition-colors">My Account Orders</Link>
                  </li>
               </ul>
            </div>
          </div>

          {/* CONTACT & SHOWROOM */}
          <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:justify-between gap-6 relative overflow-hidden">
             {/* Decorative Leaves */}
             <svg className="absolute -right-8 -bottom-10 w-48 h-48 text-emerald-900/20 rotate-12 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
               <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
             </svg>
             <svg className="absolute -left-6 -top-6 w-32 h-32 text-emerald-900/20 -rotate-[60deg] pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
               <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
             </svg>
             
             <div className="space-y-4 w-full sm:w-auto relative z-10">
                <h4 className="text-emerald-500 text-xs sm:text-sm font-bold tracking-widest uppercase">CONTACT & SHOWROOM</h4>
                <div className="space-y-3 text-sm text-neutral-300">
                   <p className="flex items-start gap-3">
                     <MapPin size={18} className="mt-0.5 text-emerald-500/70 shrink-0"/> 
                     <span>{config.address || 'Level 4, Block B, Jamuna Future Park, Dhaka, Bangladesh'}</span>
                   </p>
                   <p className="flex items-center gap-3">
                     <Phone size={18} className="text-emerald-500/70 shrink-0"/> 
                     <span>{config.helplineNumber || '01954710343'}</span>
                   </p>
                   <p className="flex items-center gap-3 break-all">
                     <Mail size={18} className="text-emerald-500/70 shrink-0"/> 
                     <span>{config.supportEmail || 'xmrezaulkarimx98@gmail.com'}</span>
                   </p>
                </div>
             </div>
             <div className="hidden sm:flex items-center justify-center w-28 h-28 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <MapPin size={40} className="text-emerald-500" />
             </div>
          </div>

          {/* PAYMENT & SECURITY */}
          <div className="flex flex-col items-center gap-8 pt-6">
             <div className="flex items-center gap-4 text-xs text-neutral-500 font-bold uppercase tracking-widest">
               <span className="w-8 h-px bg-neutral-800"></span>
               WE ACCEPT
               <span className="w-8 h-px bg-neutral-800"></span>
             </div>
             
             <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
               {/* bKash */}
               <div className="bg-white px-3 py-2 rounded border border-neutral-200 flex items-center justify-center h-[38px] w-[85px] hover:scale-105 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/BKash_Logo.svg" alt="bKash" className="h-[18px] object-contain" referrerPolicy="no-referrer" />
               </div>
               {/* Nagad */}
               <div className="bg-white px-3 py-2 rounded border border-neutral-200 flex items-center justify-center h-[38px] w-[85px] hover:scale-105 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Nagad_Logo_2019.svg" alt="Nagad" className="h-[22px] object-contain" referrerPolicy="no-referrer" />
               </div>
               {/* Rocket */}
               <div className="bg-[#8A2461] px-3 py-2 rounded flex items-center justify-center h-[38px] w-[85px] hover:scale-105 transition-transform text-white font-bold text-sm tracking-wide">
                 Rocket
               </div>
               {/* Visa */}
               <div className="bg-white px-3 py-2 rounded border border-neutral-200 flex items-center justify-center h-[38px] w-[85px] hover:scale-105 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-[14px] object-contain" referrerPolicy="no-referrer" />
               </div>
               {/* Mastercard */}
               <div className="bg-white px-3 py-2 rounded border border-neutral-200 flex items-center justify-center h-[38px] w-[85px] hover:scale-105 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-[20px] object-contain" referrerPolicy="no-referrer" />
               </div>
               {/* Amex */}
               <div className="bg-white px-3 py-2 rounded border border-neutral-200 flex items-center justify-center h-[38px] w-[85px] hover:scale-105 transition-transform">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-[22px] object-contain" referrerPolicy="no-referrer" />
               </div>
             </div>

             {/* SSL Badge */}
             <div className="flex items-center gap-3 border border-emerald-900/50 bg-emerald-900/10 text-emerald-400 px-6 py-3.5 rounded-xl">
                <ShieldCheck size={28} className="shrink-0" />
                <div className="text-left">
                   <p className="text-xs font-bold tracking-wide mb-0.5">SSL SECURED</p>
                   <p className="text-[10.5px] opacity-80 leading-none text-emerald-400/80">Your information is 100% protected</p>
                </div>
             </div>
          </div>

          {/* BOTTOM COPYRIGHT */}
          <div className="pt-6 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
             <div className="space-y-1.5">
                <p className="text-neutral-400 text-[11px]">
                  © {new Date().getFullYear()} Rare Dreams. All rights reserved.
                </p>
                <p className="text-[10px] text-neutral-500">
                  Trade License No: {config.tradeLicenseNo || 'TRAD/DNCC/012984/2026'}
                </p>
             </div>
             
             {/* Small Logo / Decorative at bottom */}
             <div className="opacity-50 hover:opacity-100 transition-opacity">
               <Logo variant="dark" size="sm" showText={true} />
             </div>
          </div>

        </div>
      </footer>

      {/* Policy Modal */}
      <PolicyModal 
        type={activePolicyModal} 
        onClose={() => setActivePolicyModal(null)} 
      />
    </>
  );
}


