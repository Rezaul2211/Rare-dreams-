import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function Account() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalTitle, setActiveModalTitle] = useState<string | null>(null);

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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAFAFC]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#5B4EFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Loading Account...</p>
        </div>
      </div>
    );
  }

  const cleanDisplayName = (user?.displayName || 'Nihad Hasan')
    .replace(/\(Admin\)/gi, '')
    .trim() || 'Nihad Hasan';

  // Counts for My Orders section
  const pendingCount = orders.filter(o => o.status?.toLowerCase() === 'pending').length || 2;
  const processingCount = orders.filter(o => o.status?.toLowerCase() === 'processing').length || 1;
  const shippedCount = orders.filter(o => o.status?.toLowerCase() === 'shipped').length || 3;
  const deliveredCount = orders.filter(o => o.status?.toLowerCase() === 'delivered').length || 2;
  const cancelledCount = orders.filter(o => o.status?.toLowerCase() === 'cancelled').length || 0;

  const menuList = [
    {
      id: 'profile',
      title: 'Profile Information',
      subtitle: 'Manage your personal details',
      icon: UserIcon,
    },
    {
      id: 'address',
      title: 'Address Book',
      subtitle: 'Save & manage your addresses',
      icon: MapPin,
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      subtitle: 'Manage your cards & wallets',
      icon: CreditCard,
    },
    {
      id: 'reviews',
      title: 'My Reviews',
      subtitle: 'Reviews on your purchased products',
      icon: Star,
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      subtitle: 'Your favorite products',
      icon: Heart,
    },
    {
      id: 'coupons',
      title: 'Coupon & Offers',
      subtitle: 'View your coupons and offers',
      icon: Ticket,
    },
    {
      id: 'chat',
      title: 'Chat with Us',
      subtitle: 'Need help? Chat with our support',
      icon: Headphones,
    },
    {
      id: 'admin',
      title: 'Admin Channel',
      subtitle: 'Admin only section',
      icon: ShieldCheck,
      isAdminChannel: true,
      badgeText: 'Admin Only',
    }
  ];

  return (
    <div className="bg-[#FAFAFC] min-h-screen py-6 px-4 sm:px-6 w-full flex-grow font-sans">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* 1. TOP PROFILE PURPLE CARD */}
        <div className="bg-gradient-to-b from-[#F4F1FF] to-[#EBE5FF] rounded-3xl p-5 sm:p-6 border border-purple-100/70 shadow-2xs space-y-5">
          {/* Top Row: User Avatar + Details + Gold Member Card */}
          <div className="flex items-center justify-between gap-4">
            {/* Left: Avatar + Info */}
            <div className="flex items-center space-x-3.5">
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-neutral-200">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop" 
                    alt={cleanDisplayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={() => setActiveModalTitle('Change Profile Photo')}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white rounded-full flex items-center justify-center border-2 border-white shadow-2xs"
                >
                  <Camera size={12} />
                </button>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight font-display">
                  {cleanDisplayName}
                </h2>
                <p className="text-xs text-neutral-500 font-medium">{user?.email || 'nihadhasan@gmail.com'}</p>
                <div className="pt-1.5">
                  <button
                    onClick={() => setActiveModalTitle('Edit Profile Details')}
                    className="inline-flex items-center space-x-1.5 bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    <Pencil size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: 4 Feature Items Card inside profile card */}
          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-purple-100/50 grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5">
                <Percent size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Exclusive<br />Discounts
              </span>
            </div>

            <div className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                <Truck size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Free<br />Shipping
              </span>
            </div>

            <div className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5">
                <Award size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Priority<br />Support
              </span>
            </div>

            <div className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors">
              <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-1.5">
                <Gift size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Special<br />Offers
              </span>
            </div>
          </div>
        </div>

        {/* 2. MY ORDERS SECTION */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight font-display">My Orders</h3>
            <button 
              onClick={() => setActiveModalTitle('All Orders')}
              className="text-xs font-bold text-[#5B4EFF] hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center py-1">
            {/* Pending */}
            <div 
              onClick={() => setActiveModalTitle('Pending Orders')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 group-hover:bg-amber-100 transition-colors flex items-center justify-center mb-1">
                <Clock size={20} />
              </div>
              <span className="text-xs font-bold text-neutral-900 font-mono">{pendingCount}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Pending</span>
            </div>

            {/* Processing */}
            <div 
              onClick={() => setActiveModalTitle('Processing Orders')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-500 group-hover:bg-blue-100 transition-colors flex items-center justify-center mb-1">
                <RefreshCw size={18} />
              </div>
              <span className="text-xs font-bold text-neutral-900 font-mono">{processingCount}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Processing</span>
            </div>

            {/* Shipped */}
            <div 
              onClick={() => setActiveModalTitle('Shipped Orders')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 transition-colors flex items-center justify-center mb-1">
                <Truck size={20} />
              </div>
              <span className="text-xs font-bold text-neutral-900 font-mono">{shippedCount}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Shipped</span>
            </div>

            {/* Delivered */}
            <div 
              onClick={() => setActiveModalTitle('Delivered Orders')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors flex items-center justify-center mb-1">
                <CheckSquare size={18} />
              </div>
              <span className="text-xs font-bold text-neutral-900 font-mono">{deliveredCount}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Delivered</span>
            </div>

            {/* Cancelled */}
            <div 
              onClick={() => setActiveModalTitle('Cancelled Orders')}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 group-hover:bg-rose-100 transition-colors flex items-center justify-center mb-1">
                <XCircle size={20} />
              </div>
              <span className="text-xs font-bold text-neutral-900 font-mono">{cancelledCount}</span>
              <span className="text-[10px] text-neutral-500 font-medium">Cancelled</span>
            </div>
          </div>
        </div>

        {/* 3. MENU ITEMS LIST */}
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {menuList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.isAdminChannel) {
                    navigate('/admin');
                  } else {
                    setActiveModalTitle(item.title);
                  }
                }}
                className={`p-4 flex items-center justify-between transition-colors cursor-pointer group ${
                  item.isAdminChannel ? 'bg-[#F9F7FF] hover:bg-[#F3EFFF]' : 'hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.isAdminChannel ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${
                      item.isAdminChannel ? 'text-[#5B4EFF]' : 'text-neutral-900'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-medium">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {item.badgeText && (
                    <span className="inline-flex items-center space-x-1 bg-[#EFE8FF] text-[#5B4EFF] text-[10px] font-bold px-3 py-1 rounded-full">
                      <span>{item.badgeText}</span>
                      <Lock size={10} />
                    </span>
                  )}
                  <ChevronRight size={16} className="text-neutral-400 group-hover:text-neutral-800 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Logout Link */}
        <div className="pt-2 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Feature Action Modal Popup */}
      {activeModalTitle && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-neutral-100">
            <div className="w-12 h-12 bg-purple-50 text-[#5B4EFF] rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-base font-black text-neutral-900">{activeModalTitle}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              <strong>{activeModalTitle}</strong> option is active in your profile. Functionality will be connected.
            </p>
            <button
              onClick={() => setActiveModalTitle(null)}
              className="w-full bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
