import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, Menu, X, User, Home, Grid, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../lib/firebase';
import { FlyToCartProvider, useFlyToCart } from '../context/FlyToCartContext';
import { HeaderSearch } from './HeaderSearch';
import Footer from './Footer';
import WhatsAppSupportWidget from './WhatsAppSupportWidget';
import Logo from './Logo';


function LayoutInner() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const wishlistIds = useWishlistStore((state) => state.wishlistIds);
  const user = useAuthStore((state) => state.user);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistIds.length;
  const navigate = useNavigate();
  const location = useLocation();
  const { isCartBouncing } = useFlyToCart();

  const handleLogout = () => {
    auth.signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-neutral-900 pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 gap-4">
            {/* LEFT: Logo */}
            <Link 
              to="/" 
              onClick={scrollToTop}
              className="shrink-0 hover:opacity-90 transition-opacity flex items-center py-1"
              aria-label="Rare Dreams Home"
            >
              <Logo size="md" variant="light" />
            </Link>

            {/* CENTER: Desktop Nav Links or Search */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/shop" onClick={scrollToTop} className="text-xs font-bold hover:text-neutral-500 transition-colors uppercase tracking-widest text-neutral-800">Shop All</Link>
              <Link to="/category/Boys Wear" onClick={scrollToTop} className="text-xs font-bold hover:text-neutral-500 transition-colors uppercase tracking-widest text-neutral-800">Boys</Link>
              <Link to="/category/Girls Wear" onClick={scrollToTop} className="text-xs font-bold hover:text-neutral-500 transition-colors uppercase tracking-widest text-neutral-800">Girls</Link>
              <Link to="/category/Baby Essentials" onClick={scrollToTop} className="text-xs font-bold hover:text-neutral-500 transition-colors uppercase tracking-widest text-neutral-800">Baby</Link>
              <Link to="/category/Footwear" onClick={scrollToTop} className="text-xs font-bold hover:text-neutral-500 transition-colors uppercase tracking-widest text-neutral-800">Shoes</Link>
            </nav>

            {/* RIGHT: Action Icons (Search, Cart, Menu) - Exact Zopono style */}
            <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
              {/* Visible Admin Dashboard link button for admins */}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-black text-white rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-xs"
                >
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Search Toggle Icon */}
              <button
                className="p-2.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800 cursor-pointer"
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                aria-label="Search"
              >
                <Search size={22} strokeWidth={1.75} />
              </button>

              {/* Header Cart Bag Icon with Counter */}
              <Link 
                id="header-cart-icon"
                to="/cart" 
                className={`p-2.5 hover:bg-neutral-100 rounded-full transition-all relative text-neutral-800 ${
                  isCartBouncing ? 'scale-125 ring-2 ring-black bg-neutral-100' : ''
                }`}
                aria-label="Cart"
              >
                <ShoppingBag size={22} strokeWidth={1.75} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-0.5 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 text-[10px] font-bold leading-none text-white bg-neutral-800 rounded-full shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Toggle Button */}
              <button 
                className="p-2.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Expandable Search Bar Header Overlay */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 shadow-md overflow-hidden"
            >
              <HeaderSearch 
                isMobileModalOpen={isMobileSearchOpen} 
                onCloseMobileModal={() => setIsMobileSearchOpen(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-200">
            <div className="px-4 pt-3 pb-6 space-y-2">
              <div className="pb-2">
                <HeaderSearch onCloseMobileModal={() => setIsMobileMenuOpen(false)} />
              </div>
              <Link to="/shop" className="block px-3 py-2.5 text-sm font-bold border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Shop All Products</Link>
              <Link to="/category/Boys Wear" className="block px-3 py-2.5 text-sm font-bold border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Boys Wear</Link>
              <Link to="/category/Girls Wear" className="block px-3 py-2.5 text-sm font-bold border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Girls Wear</Link>
              <Link to="/category/Baby Essentials" className="block px-3 py-2.5 text-sm font-bold border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Baby Essentials</Link>
              <Link to="/category/Footwear" className="block px-3 py-2.5 text-sm font-bold border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Footwear</Link>

              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center justify-between px-3 py-3 text-sm font-bold text-amber-900 bg-amber-50 rounded-xl my-2 uppercase tracking-wide" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck size={18} className="text-amber-600" />
                    <span>Admin Panel</span>
                  </div>
                  <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-md font-black">ADMIN</span>
                </Link>
              )}

              <Link to={user ? '/account' : '/login'} className="block px-3 py-2.5 text-sm font-bold border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content with smooth page transition */}
      <main className="flex-grow flex flex-col min-h-[60vh] overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="flex-grow flex flex-col w-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Redesigned Premium Footer */}
      <Footer />

      {/* Floating WhatsApp & AI Support Widget */}
      <WhatsAppSupportWidget />

      {/* Mobile Bottom Navigation */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 flex justify-around items-center h-16 z-50 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <Link to="/" onClick={scrollToTop} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname === '/' ? 'text-black' : 'text-neutral-400 hover:text-black'}`}>
          <Home size={20} className={location.pathname === '/' ? 'fill-black' : ''} />
          <span className="text-[10px] mt-1 font-bold">Home</span>
        </Link>
        <Link to="/shop" onClick={scrollToTop} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname.includes('/shop') || location.pathname.includes('/category') ? 'text-black' : 'text-neutral-400 hover:text-black'}`}>
          <Grid size={20} className={location.pathname.includes('/shop') || location.pathname.includes('/category') ? 'fill-black' : ''} />
          <span className="text-[10px] mt-1 font-bold">Shop</span>
        </Link>
        <Link 
          id="mobile-cart-icon"
          to="/cart" 
          onClick={scrollToTop}
          className={`flex flex-col items-center justify-center w-full h-full relative transition-all ${
            location.pathname === '/cart' ? 'text-black' : 'text-neutral-400 hover:text-black'
          } ${isCartBouncing ? 'scale-125 text-black' : ''}`}
        >
          <div className="relative">
            <ShoppingBag size={20} className={location.pathname === '/cart' ? 'fill-black' : ''} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black text-white bg-black rounded-full shadow-xs">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-bold">Cart</span>
        </Link>
        <Link to={user ? '/account' : '/login'} onClick={scrollToTop} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname.includes('/account') || location.pathname.includes('/login') ? 'text-black' : 'text-neutral-400 hover:text-black'}`}>
          <User size={20} className={location.pathname.includes('/account') || location.pathname.includes('/login') ? 'fill-black' : ''} />
          <span className="text-[10px] mt-1 font-bold">Account</span>
        </Link>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <FlyToCartProvider>
      <LayoutInner />
    </FlyToCartProvider>
  );
}


