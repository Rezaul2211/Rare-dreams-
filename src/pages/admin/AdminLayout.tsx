import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Package, ShoppingCart, LayoutDashboard, LogOut, Store, Menu, X, ShieldCheck, ArrowLeft } from 'lucide-react';
import { auth } from '../../lib/firebase';

export default function AdminLayout() {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-100 font-medium">Loading panel...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    auth.signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-100 font-sans">
      {/* Mobile Top Header with Direct Round Back Button */}
      <div className="md:hidden bg-white border-b border-neutral-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center space-x-3">
          {/* Circular Direct Back Button */}
          <button 
            onClick={() => navigate('/')} 
            className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-sm shrink-0"
            title="Return to Main Store"
            aria-label="Back to store"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-1 text-[10px] font-black uppercase text-amber-600">
              <ShieldCheck size={12} />
              <span>Admin Panel</span>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-tight text-neutral-900">Rare Dreams</h2>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-xl"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/')} 
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-sm shrink-0"
              title="Return to Store"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="inline-flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded mb-1">
                <ShieldCheck size={12} />
                <span>Verified Admin</span>
              </div>
              <h2 className="text-lg font-black uppercase tracking-tighter">Rare Dreams</h2>
            </div>
          </div>
          <button className="md:hidden p-1 text-neutral-400" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Navigation</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-black text-white font-bold shadow-sm' : 'text-neutral-600 hover:bg-neutral-100 font-medium'
                }`}
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Store Access</p>
            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-neutral-900 hover:bg-neutral-100 font-bold transition-colors border border-neutral-200"
            >
              <Store size={20} className="text-amber-500" />
              <span>Back to Main Store</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50/50">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold text-neutral-900 truncate">{user.displayName || 'Admin User'}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Header Bar for Admin Panel */}
        <div className="bg-white border-b border-neutral-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/')} 
              className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-xs"
              title="Return to Main Store"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Admin Workspace</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
            >
              <Store size={15} className="text-amber-400" />
              <span>Return to Store</span>
            </Link>
          </div>
        </div>

        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

