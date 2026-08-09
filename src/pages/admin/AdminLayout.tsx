import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  LogOut, 
  Store, 
  Menu, 
  X, 
  ShieldCheck, 
  ArrowLeft, 
  Users, 
  Image, 
  Bell, 
  Crown 
} from 'lucide-react';
import { auth } from '../../lib/firebase';

export default function AdminLayout() {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 font-medium">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading Admin Panel...</p>
        </div>
      </div>
    );
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
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Banners & Styling', path: '/admin/settings', icon: Image },
  ];

  const cleanAdminName = (user?.displayName || 'Rezaul Karim')
    .replace(/\(Admin\)/gi, '')
    .trim() || 'Rezaul Karim';

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F8F9FC] font-sans">
      {/* Top Header Bar matching Screenshot 2 */}
      <div className="bg-white border-b border-neutral-200/80 px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center space-x-3">
          {/* Toggle Menu button */}
          <button 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo Brand */}
          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-xs">
              <Crown size={18} className="text-neutral-900 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 font-display">
                RARE DREAMS
              </h2>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider -mt-0.5">
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Header Right Tools: Back button, Notification Bell, Admin Avatar */}
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition-colors"
            title="View Live Store"
          >
            <Store size={14} className="text-amber-600" />
            <span>Store</span>
          </Link>

          {/* Notification Bell with Badge */}
          <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
              3
            </span>
          </button>

          {/* User Avatar with Green Active Dot */}
          <div className="relative shrink-0 cursor-pointer" onClick={() => navigate('/account')}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
              alt={cleanAdminName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
      </div>

      {/* Sidebar Drawer */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200/80 flex flex-col transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={18} className="text-amber-500" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Verified Session</p>
              <h3 className="text-xs font-bold text-neutral-900">{cleanAdminName}</h3>
            </div>
          </div>
          <button className="md:hidden p-1 text-neutral-400" onClick={() => setIsMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Management</p>
          {navItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-neutral-900 text-white font-bold shadow-xs' 
                    : 'text-neutral-600 hover:bg-neutral-100 font-medium'
                }`}
              >
                <item.icon size={18} />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-6">
            <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Quick Navigation</p>
            <Link
              to="/account"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-neutral-800 hover:bg-neutral-100 text-xs font-bold transition-colors border border-neutral-200/80 mb-2"
            >
              <ShieldCheck size={18} className="text-purple-600" />
              <span>User Profile View</span>
            </Link>

            <Link
              to="/"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-neutral-800 hover:bg-neutral-100 text-xs font-bold transition-colors border border-neutral-200/80"
            >
              <Store size={18} className="text-amber-500" />
              <span>Back to Main Store</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50">
          <div className="px-4 py-2 mb-1">
            <p className="text-xs font-bold text-neutral-900 truncate">{cleanAdminName}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
