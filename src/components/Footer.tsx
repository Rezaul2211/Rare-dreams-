import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Award, 
  RefreshCw, 
  Lock, 
  CheckCircle,
  ExternalLink,
  Send,
  MessageCircle
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* TOP BENEFIT BADGES ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-12 border-b border-neutral-800 text-center sm:text-left">
            <div className="flex items-center space-x-3 bg-neutral-800/60 p-4 rounded-2xl border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-[#5B4EFF]/20 text-[#8B82FF] flex items-center justify-center shrink-0">
                <RefreshCw size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('home.easy_return_title')}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('home.easy_return_desc')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-neutral-800/60 p-4 rounded-2xl border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('home.premium_quality_title')}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('home.premium_quality_desc')}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-neutral-800/60 p-4 rounded-2xl border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Licensed Brand</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">DBID & Govt Registered</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-neutral-800/60 p-4 rounded-2xl border border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('home.cash_on_delivery_title')}</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">{t('home.cash_on_delivery_desc')}</p>
              </div>
            </div>
          </div>

          {/* MAIN FOOTER GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* COL 1: BRAND INFO & SOCIAL LINKS */}
            <div className="md:col-span-4 space-y-5">
              <div>
                <Link to="/" onClick={scrollToTop} className="inline-block hover:opacity-90 transition-opacity">
                  <Logo variant="dark" size="md" showText={true} />
                </Link>
                <p className="text-xs text-neutral-400 leading-relaxed mt-2 pr-4">
                  {t('footer.company_desc')}
                </p>
              </div>

              {/* Verified Trade License Badge */}
              <button 
                onClick={() => setActivePolicyModal('license')}
                className="inline-flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700/80 px-3 py-1.5 rounded-xl border border-neutral-700 text-[11px] text-amber-300 font-mono transition-colors text-left"
              >
                <Award size={14} className="text-amber-400 shrink-0" />
                <span>{t('footer.trade_license')} <strong className="text-white">{config.tradeLicenseNo || 'TRAD/DNCC/012984/2026'}</strong></span>
              </button>

              {/* Social Media Links Icons */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Follow Us On Social Media:
                </span>
                <div className="flex items-center space-x-2.5">
                  {/* Facebook */}
                  <a 
                    href={config.facebookUrl || "https://facebook.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-neutral-800 hover:bg-[#1877F2] text-white flex items-center justify-center transition-all shadow-xs group"
                    title="Facebook Page"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a 
                    href={config.instagramUrl || "https://instagram.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-neutral-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-white flex items-center justify-center transition-all shadow-xs"
                    title="Instagram Profile"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a 
                    href={`https://wa.me/${(config.whatsappNumber || '').replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-neutral-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-all shadow-xs"
                    title="WhatsApp Helpline"
                  >
                    <MessageCircle size={20} className="fill-white" />
                  </a>

                  {/* YouTube */}
                  <a 
                    href={config.youtubeUrl || "https://youtube.com"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl bg-neutral-800 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-xs"
                    title="YouTube Channel"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* COL 2: QUICK SHOP */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                {t('home.explore_categories')}
              </h4>
              <ul className="space-y-2.5 text-xs">
                {categories.map((cat, idx) => (
                  <li key={cat.id || idx}>
                    <Link 
                      to={cat.link || `/category/${encodeURIComponent(cat.title)}`} 
                      onClick={scrollToTop} 
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {translateCategory(cat.title, language)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/shop" onClick={scrollToTop} className="text-neutral-400 hover:text-white transition-colors">
                    {t('nav.shop_all')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* COL 3: CUSTOMER POLICIES */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                {t('footer.customer_service')}
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <button 
                    onClick={() => setActivePolicyModal('returns')} 
                    className="text-neutral-400 hover:text-emerald-400 transition-colors text-left flex items-center space-x-1"
                  >
                    <span>{t('footer.return_policy')}</span>
                    <ExternalLink size={11} />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActivePolicyModal('license')} 
                    className="text-neutral-400 hover:text-amber-400 transition-colors text-left flex items-center space-x-1"
                  >
                    <span>Trade License & Verification</span>
                    <ExternalLink size={11} />
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActivePolicyModal('privacy')} 
                    className="text-neutral-400 hover:text-white transition-colors text-left"
                  >
                    {t('footer.privacy_policy')}
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActivePolicyModal('terms')} 
                    className="text-neutral-400 hover:text-white transition-colors text-left"
                  >
                    {t('footer.terms_conditions')}
                  </button>
                </li>
                <li>
                  <Link to="/account" onClick={scrollToTop} className="text-neutral-400 hover:text-white transition-colors">
                    My Account Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* COL 4: STORE HELPLINE & NEWSLETTER */}
            <div className="md:col-span-3 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
                {t('footer.contact_us')}
              </h4>
              <div className="space-y-2 text-xs text-neutral-400">
                <p className="flex items-start space-x-2">
                  <MapPin size={16} className="text-[#8B82FF] shrink-0 mt-0.5" />
                  <span>{config.address || 'Jamuna Future Park, Level 4, Dhaka, Bangladesh'}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Phone size={15} className="text-emerald-400 shrink-0" />
                  <span className="font-mono text-white font-bold">{config.helplineNumber || config.whatsappNumber}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail size={15} className="text-amber-400 shrink-0" />
                  <span>{config.supportEmail}</span>
                </p>
              </div>

              {/* Newsletter Form */}
              <div className="pt-2">
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider block">
                    Get Promo Updates
                  </label>
                  <div className="flex items-center bg-neutral-800 rounded-xl p-1 border border-neutral-700">
                    <input 
                      type="email" 
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Your email address" 
                      className="bg-transparent text-xs text-white px-3 py-1.5 w-full outline-none placeholder:text-neutral-500"
                    />
                    <button 
                      type="submit" 
                      className="bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  {subscribed && (
                    <p className="text-[11px] text-emerald-400 flex items-center space-x-1">
                      <CheckCircle size={12} />
                      <span>Thank you for subscribing!</span>
                    </p>
                  )}
                </form>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: PAYMENT METHOD BADGES & COPYRIGHT */}
          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1">
              <p className="text-neutral-400 text-xs">
                {t('footer.all_rights_reserved')}
              </p>
              <p className="text-[11px] text-neutral-500 font-mono">
                DBID: {config.dbidNo || 'DBID-2026-884129'} • {t('footer.trade_license')} {config.tradeLicenseNo || 'TRAD/DNCC/012984/2026'}
              </p>
            </div>

            {/* Verified Payment Method Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold">
              <span className="bg-pink-600/20 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-lg">
                bKash ({config.bkashNumber || 'Merchant'})
              </span>
              <span className="bg-orange-600/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-lg">
                Nagad ({config.nagadNumber || 'Merchant'})
              </span>
              <span className="bg-purple-600/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg">
                Rocket
              </span>
              <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg">
                Visa / MasterCard
              </span>
              <span className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg">
                Cash On Delivery
              </span>
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

