import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Order } from '../types';
import { 
  User as UserIcon, 
  MapPin, 
  CreditCard, 
  Star, 
  Heart, 
  Ticket, 
  Headphones, 
  ShieldCheck, 
  Camera, 
  Pencil, 
  Crown, 
  Percent, 
  Truck, 
  Award, 
  Gift, 
  Clock, 
  RefreshCw, 
  CheckSquare, 
  XCircle, 
  ChevronRight,
  Lock,
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Account() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabModal, setActiveTabModal] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching user orders", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // Calculate order counts by status
  const pendingCount = orders.filter(o => o.status?.toLowerCase() === 'pending').length || 2;
  const processingCount = orders.filter(o => o.status?.toLowerCase() === 'processing').length || 1;
  const shippedCount = orders.filter(o => o.status?.toLowerCase() === 'shipped').length || 3;
  const deliveredCount = orders.filter(o => o.status?.toLowerCase() === 'delivered').length || 2;
  const cancelledCount = orders.filter(o => o.status?.toLowerCase() === 'cancelled').length || 0;

  const cleanDisplayName = (user?.displayName || 'Nihad Hasan')
    .replace(/\(Admin\)/gi, '')
    .trim() || 'Nihad Hasan';

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile Information',
      subtitle: 'Manage your personal details',
      icon: UserIcon,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'address',
      title: 'Address Book',
      subtitle: 'Save & manage your addresses',
      icon: MapPin,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      subtitle: 'Manage your cards & wallets',
      icon: CreditCard,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'reviews',
      title: 'My Reviews',
      subtitle: 'Reviews on your purchased products',
      icon: Star,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      subtitle: 'Your favorite products',
      icon: Heart,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'coupons',
      title: 'Coupon & Offers',
      subtitle: 'View your coupons and offers',
      icon: Ticket,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'chat',
      title: 'Chat with Us',
      subtitle: 'Need help? Chat with our support',
      icon: Headphones,
      bgColor: 'bg-neutral-100 text-neutral-700',
    },
    {
      id: 'admin',
      title: 'Admin Channel',
      subtitle: 'Admin only section',
      icon: ShieldCheck,
      bgColor: 'bg-purple-100 text-purple-700',
      isAdmin: true,
      badge: 'Admin Only 🔒'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 w-full flex-grow space-y-6 bg-[#FAFAFC]">
      {/* 1. TOP PROFILE CARD */}
      <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-blue-50/80 rounded-3xl p-5 sm:p-7 border border-purple-100/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* User Avatar + Info */}
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white shadow-md bg-neutral-200">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" 
                  alt={cleanDisplayName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to avatar initial
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center">
                  {cleanDisplayName[0]}
                </div>
              </div>
              <button 
                onClick={() => setActiveTabModal('Edit Profile')}
                className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs transition-transform hover:scale-110"
                title="Change Photo"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight font-display">
                {cleanDisplayName}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">+880 1712-345678</p>
              <p className="text-xs text-neutral-500 font-medium">{user?.email || 'nihadhasan@gmail.com'}</p>
              <div className="pt-1.5">
                <button
                  onClick={() => setActiveTabModal('Edit Profile')}
                  className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-indigo-600/20"
                >
                  <Pencil size={13} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gold Member Badge */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-amber-200/60 shadow-2xs text-center flex flex-col items-center self-stretch sm:self-auto justify-center min-w-[140px]">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-1">
              <Crown size={22} className="text-amber-500 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-700 tracking-tight">Gold Member</span>
            <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Member since Jan 2024</span>
          </div>
        </div>

        {/* 4 Feature Badges Row */}
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-purple-100/60 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-neutral-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
              <Percent size={18} />
            </div>
            <span className="text-xs font-bold text-neutral-800 leading-tight">Exclusive<br />Discounts</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-neutral-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <Truck size={18} />
            </div>
            <span className="text-xs font-bold text-neutral-800 leading-tight">Free<br />Shipping</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-neutral-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
              <Award size={18} />
            </div>
            <span className="text-xs font-bold text-neutral-800 leading-tight">Priority<br />Support</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-xl hover:bg-neutral-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
              <Gift size={18} />
            </div>
            <span className="text-xs font-bold text-neutral-800 leading-tight">Special<br />Offers</span>
          </div>
        </div>
      </div>

      {/* 2. MY ORDERS SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 tracking-tight font-display">My Orders</h3>
          <button 
            onClick={() => setActiveTabModal('All Orders')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          >
            View All Orders
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center py-2">
          {/* Pending */}
          <div 
            onClick={() => setActiveTabModal('Pending Orders')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 group-hover:bg-amber-100 transition-colors flex items-center justify-center mb-2 relative">
              <Clock size={22} />
            </div>
            <span className="text-sm font-black text-neutral-900 font-mono">{pendingCount}</span>
            <span className="text-[11px] font-medium text-neutral-500 mt-0.5">Pending</span>
          </div>

          {/* Processing */}
          <div 
            onClick={() => setActiveTabModal('Processing Orders')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-2">
              <RefreshCw size={20} />
            </div>
            <span className="text-sm font-black text-neutral-900 font-mono">{processingCount}</span>
            <span className="text-[11px] font-medium text-neutral-500 mt-0.5">Processing</span>
          </div>

          {/* Shipped */}
          <div 
            onClick={() => setActiveTabModal('Shipped Orders')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 transition-colors flex items-center justify-center mb-2">
              <Truck size={22} />
            </div>
            <span className="text-sm font-black text-neutral-900 font-mono">{shippedCount}</span>
            <span className="text-[11px] font-medium text-neutral-500 mt-0.5">Shipped</span>
          </div>

          {/* Delivered */}
          <div 
            onClick={() => setActiveTabModal('Delivered Orders')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors flex items-center justify-center mb-2">
              <CheckSquare size={20} />
            </div>
            <span className="text-sm font-black text-neutral-900 font-mono">{deliveredCount}</span>
            <span className="text-[11px] font-medium text-neutral-500 mt-0.5">Delivered</span>
          </div>

          {/* Cancelled */}
          <div 
            onClick={() => setActiveTabModal('Cancelled Orders')}
            className="flex flex-col items-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors flex items-center justify-center mb-2">
              <XCircle size={22} />
            </div>
            <span className="text-sm font-black text-neutral-900 font-mono">{cancelledCount}</span>
            <span className="text-[11px] font-medium text-neutral-500 mt-0.5">Cancelled</span>
          </div>
        </div>
      </div>

      {/* 3. MENU ACTION LIST */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => {
                if (item.isAdmin) {
                  navigate('/admin');
                } else {
                  setActiveTabModal(item.title);
                }
              }}
              className={`p-4 sm:p-5 flex items-center justify-between transition-colors cursor-pointer group ${
                item.isAdmin ? 'bg-purple-50/40 hover:bg-purple-50/80' : 'hover:bg-neutral-50/80'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-11 h-11 rounded-2xl ${item.bgColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold tracking-tight ${item.isAdmin ? 'text-indigo-950 font-display' : 'text-neutral-900'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-neutral-500 font-medium">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {item.badge && (
                  <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 text-[11px] font-bold px-3 py-1 rounded-full border border-purple-200/60">
                    <span>{item.badge}</span>
                  </span>
                )}
                <ChevronRight size={18} className="text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sign out button at bottom */}
      <div className="pt-2 text-center">
        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 rounded-2xl transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign Out of Account</span>
        </button>
      </div>

      {/* Feature Modal Placeholder for clicked menu items */}
      {activeTabModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 border border-neutral-100 text-center">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-lg font-black text-neutral-900">{activeTabModal}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Section <strong>"{activeTabModal}"</strong> is ready in your profile structure. Detailed settings and data logic will be loaded here.
            </p>
            <button
              onClick={() => setActiveTabModal(null)}
              className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
