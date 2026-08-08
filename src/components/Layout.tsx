import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User, Home, Grid, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../lib/firebase';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const user = useAuthStore((state) => state.user);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    auth.signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-neutral-900 pb-16 md:pb-0">
      {/* Top Banner */}
      <div className="bg-black text-white text-xs py-2 text-center tracking-wider">
        FREE SHIPPING ON ORDERS OVER $200
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="text-2xl font-bold tracking-tighter uppercase shrink-0">
              Rare Dreams
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/shop" className="text-sm font-medium hover:text-neutral-500 transition-colors uppercase tracking-wide">Shop All</Link>
              <Link to="/category/Men" className="text-sm font-medium hover:text-neutral-500 transition-colors uppercase tracking-wide">Men</Link>
              <Link to="/category/Women" className="text-sm font-medium hover:text-neutral-500 transition-colors uppercase tracking-wide">Women</Link>
              <Link to="/category/Kids" className="text-sm font-medium hover:text-neutral-500 transition-colors uppercase tracking-wide">Kids</Link>
            </nav>

            {/* Icons & Admin Shortcut */}
            <div className="flex items-center space-x-3">
              {/* Visible Admin Dashboard link button for admins */}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
                >
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors hidden sm:block">
                <Search size={20} />
              </button>

              {/* User Menu Dropdown */}
              <div className="relative hidden sm:block">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex items-center"
                  aria-label="User Account Menu"
                >
                  <User size={20} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 text-left">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Signed in as</p>
                          <p className="text-sm font-medium truncate text-neutral-900">{user.displayName || user.email}</p>
                          {user.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                              Admin Role
                            </span>
                          )}
                        </div>

                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-bold text-neutral-900 hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <LayoutDashboard size={16} className="text-amber-500" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <Link 
                          to="/account" 
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>My Account</span>
                        </Link>

                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <Link 
                        to="/login" 
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Sign In / Register</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Link to="/cart" className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative">
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-black rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-200">
            <div className="px-4 pt-2 pb-6 space-y-1">
              <Link to="/shop" className="block px-3 py-3 text-base font-medium border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
              <Link to="/category/Men" className="block px-3 py-3 text-base font-medium border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Men</Link>
              <Link to="/category/Women" className="block px-3 py-3 text-base font-medium border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Women</Link>
              <Link to="/category/Kids" className="block px-3 py-3 text-base font-medium border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>Kids</Link>

              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className="flex items-center justify-between px-3 py-3 text-base font-bold text-amber-900 bg-amber-50 rounded-xl my-2 uppercase tracking-wide" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck size={20} className="text-amber-600" />
                    <span>Admin Dashboard</span>
                  </div>
                  <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-black">ADMIN</span>
                </Link>
              )}

              <Link to={user ? '/account' : '/login'} className="block px-3 py-3 text-base font-medium border-b border-neutral-100 uppercase tracking-wide" onClick={() => setIsMobileMenuOpen(false)}>
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 pt-16 pb-8 md:pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            <div className="md:col-span-4">
              <Link to="/" className="inline-block mb-6">
                <h3 className="text-2xl font-black tracking-tight text-neutral-900">Rare Dreams</h3>
              </Link>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6 pr-4">
                Premium fashion for the modern individual. Elevate your everyday style with our carefully curated collections.
              </p>
              <div className="flex space-x-4">
                {['Facebook', 'Instagram', 'Twitter'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-black hover:text-white transition-colors">
                    <span className="text-xs font-medium">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-neutral-900 mb-6">Shop</h4>
              <ul className="space-y-4">
                <li><Link to="/category/Men" className="text-neutral-500 hover:text-black text-sm transition-colors">Men's Collection</Link></li>
                <li><Link to="/category/Women" className="text-neutral-500 hover:text-black text-sm transition-colors">Women's Collection</Link></li>
                <li><Link to="/category/Kids" className="text-neutral-500 hover:text-black text-sm transition-colors">Kids' Collection</Link></li>
                <li><Link to="/shop" className="text-neutral-500 hover:text-black text-sm transition-colors">New Arrivals</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold text-neutral-900 mb-6">Support</h4>
              <ul className="space-y-4">
                <li><Link to="#" className="text-neutral-500 hover:text-black text-sm transition-colors">Contact Us</Link></li>
                <li><Link to="#" className="text-neutral-500 hover:text-black text-sm transition-colors">FAQs</Link></li>
                <li><Link to="#" className="text-neutral-500 hover:text-black text-sm transition-colors">Shipping & Returns</Link></li>
                <li><Link to="#" className="text-neutral-500 hover:text-black text-sm transition-colors">Size Guide</Link></li>
              </ul>
            </div>
            
            <div className="md:col-span-4">
              <h4 className="text-sm font-bold text-neutral-900 mb-6">Stay in the loop</h4>
              <p className="text-neutral-500 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-neutral-100 text-neutral-900 px-4 py-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-black/5"
                />
                <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-sm">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-neutral-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} Rare Dreams. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="#" className="text-neutral-400 hover:text-black text-sm transition-colors">Privacy Policy</Link>
              <Link to="#" className="text-neutral-400 hover:text-black text-sm transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center h-16 z-50 px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname === '/' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>
          <Home size={20} className={location.pathname === '/' ? 'fill-black' : ''} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname.includes('/shop') || location.pathname.includes('/category') ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>
          <Grid size={20} className={location.pathname.includes('/shop') || location.pathname.includes('/category') ? 'fill-black' : ''} />
          <span className="text-[10px] mt-1 font-medium">Category</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center justify-center w-full h-full relative transition-colors ${location.pathname === '/cart' ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>
          <div className="relative">
            <ShoppingBag size={20} className={location.pathname === '/cart' ? 'fill-black' : ''} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-bold text-white bg-black rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium">Cart</span>
        </Link>
        <Link to={user ? '/account' : '/login'} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${location.pathname.includes('/account') || location.pathname.includes('/login') ? 'text-black' : 'text-neutral-500 hover:text-black'}`}>
          <User size={20} className={location.pathname.includes('/account') || location.pathname.includes('/login') ? 'fill-black' : ''} />
          <span className="text-[10px] mt-1 font-medium">Account</span>
        </Link>
      </div>
    </div>
  );
}

