import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { Order, AddressItem, PaymentMethodItem, Product } from '../types';
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
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  Copy,
  Send,
  X,
  Phone,
  Mail,
  Home as HomeIcon,
  ShoppingBasket
} from 'lucide-react';

interface ReviewItem {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
];

const INITIAL_COUPONS = [
  { code: 'RARE10', discount: '10% OFF', description: 'Applicable on all luxury items above ৳1,000', expiry: '31 Dec 2026' },
  { code: 'FREESHIP', discount: 'FREE SHIPPING', description: 'Free nationwide delivery on orders over ৳2,000', expiry: '30 Nov 2026' },
  { code: 'WELCOME20', discount: '20% OFF', description: 'First order special welcome discount voucher', expiry: '15 Oct 2026' },
];

export default function Account() {
  const { user, logout, updateUserProfile } = useAuthStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form States
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Address Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // Payment Form State
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [payType, setPayType] = useState<'bKash' | 'Nagad' | 'Card' | 'Bank'>('bKash');
  const [payNumber, setPayNumber] = useState('');
  const [payName, setPayName] = useState('');
  const [payDefault, setPayDefault] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      productName: 'Premium Velvet Blazer',
      rating: 5,
      comment: 'Absolutely stunning fabric quality and fitting! Delivered in just 2 days.',
      date: 'Aug 04, 2026'
    }
  ]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewProduct, setReviewProduct] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'support'; text: string; time: string }>>([
    { sender: 'support', text: 'Hello! Welcome to Redreams Support. How can we assist you today?', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Coupon Copy Toast State
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setProfileName(user.displayName || '');
    setProfilePhone(user.phoneNumber || '');
    setProfilePhoto(user.photoURL || AVATAR_PRESETS[0]);

    const fetchData = async () => {
      try {
        // Fetch Orders
        const qOrders = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const ordersSnapshot = await getDocs(qOrders);
        const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);

        // Fetch Wishlist Items
        const qWishlist = query(
          collection(db, 'products')
        );
        const productsSnapshot = await getDocs(qWishlist);
        const allProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setWishlistProducts(allProducts.slice(0, 3));
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName: profileName,
      phoneNumber: profilePhone,
      photoURL: profilePhoto
    });
    setActiveModal(null);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet || !addrCity) return;

    const newAddr: AddressItem = {
      id: 'addr-' + Date.now(),
      name: addrName || user?.displayName || 'Home',
      phone: addrPhone || user?.phoneNumber || '',
      address: addrStreet,
      city: addrCity,
      postalCode: addrPostal,
      isDefault: addrDefault || (user?.addresses?.length === 0)
    };

    const currentAddresses = user?.addresses || [];
    const updatedAddresses = addrDefault 
      ? [...currentAddresses.map(a => ({ ...a, isDefault: false })), newAddr]
      : [...currentAddresses, newAddr];

    await updateUserProfile({ addresses: updatedAddresses });
    setIsAddingAddress(false);
    setAddrStreet('');
    setAddrCity('');
    setAddrPostal('');
    setAddrPhone('');
    setAddrName('');
  };

  const handleDeleteAddress = async (id: string) => {
    const updated = (user?.addresses || []).filter(a => a.id !== id);
    await updateUserProfile({ addresses: updated });
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payNumber) return;

    const newPay: PaymentMethodItem = {
      id: 'pay-' + Date.now(),
      type: payType,
      accountNumber: payNumber,
      accountName: payName || user?.displayName || 'Primary Account',
      isDefault: payDefault || (user?.paymentMethods?.length === 0)
    };

    const currentPayments = user?.paymentMethods || [];
    const updatedPayments = payDefault
      ? [...currentPayments.map(p => ({ ...p, isDefault: false })), newPay]
      : [...currentPayments, newPay];

    await updateUserProfile({ paymentMethods: updatedPayments });
    setIsAddingPayment(false);
    setPayNumber('');
    setPayName('');
  };

  const handleDeletePayment = async (id: string) => {
    const updated = (user?.paymentMethods || []).filter(p => p.id !== id);
    await updateUserProfile({ paymentMethods: updated });
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProduct || !reviewComment) return;

    const newRev: ReviewItem = {
      id: 'rev-' + Date.now(),
      productName: reviewProduct,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setReviews([newRev, ...reviews]);
    setReviewProduct('');
    setReviewComment('');
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user' as const, text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Auto support response
    setTimeout(() => {
      const replies = [
        "Thank you for contacting us! Our support team is reviewing your message and will update you shortly.",
        "Your order status is tracked live in your account! Is there anything specific about your order you would like us to check?",
        "We offer fast delivery across Bangladesh (1-2 days Dhaka, 2-4 days Outside Dhaka)."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages(prev => [...prev, {
        sender: 'support' as const,
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
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

  // Order Counts
  const pendingCount = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
  const processingCount = orders.filter(o => o.status?.toLowerCase() === 'processing').length;
  const shippedCount = orders.filter(o => o.status?.toLowerCase() === 'shipped').length;
  const deliveredCount = orders.filter(o => o.status?.toLowerCase() === 'delivered').length;
  const cancelledCount = orders.filter(o => o.status?.toLowerCase() === 'cancelled').length;

  const getFilteredOrders = (filter: string) => {
    if (filter === 'All') return orders;
    return orders.filter(o => o.status?.toLowerCase() === filter.toLowerCase());
  };

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
      subtitle: `${user?.addresses?.length || 0} saved address${user?.addresses?.length === 1 ? '' : 'es'}`,
      icon: MapPin,
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      subtitle: `${user?.paymentMethods?.length || 0} saved wallet${user?.paymentMethods?.length === 1 ? '' : 's'}`,
      icon: CreditCard,
    },
    {
      id: 'reviews',
      title: 'My Reviews',
      subtitle: `${reviews.length} product reviews written`,
      icon: Star,
    },
    {
      id: 'wishlist',
      title: 'Wishlist',
      subtitle: `${wishlistProducts.length} saved items`,
      icon: Heart,
    },
    {
      id: 'coupons',
      title: 'Coupon & Offers',
      subtitle: `${INITIAL_COUPONS.length} active promo codes`,
      icon: Ticket,
    },
    {
      id: 'chat',
      title: 'Chat with Us',
      subtitle: 'Instant customer support',
      icon: Headphones,
    },
    {
      id: 'admin',
      title: 'Admin Channel',
      subtitle: 'Manage store orders & inventory',
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
          <div className="flex items-center justify-between gap-4">
            {/* User Avatar + Details */}
            <div className="flex items-center space-x-3.5">
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-neutral-200">
                  <img 
                    src={user?.photoURL || AVATAR_PRESETS[0]} 
                    alt={cleanDisplayName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={() => setActiveModal('profile')}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white rounded-full flex items-center justify-center border-2 border-white shadow-2xs"
                >
                  <Camera size={12} />
                </button>
              </div>

              <div className="space-y-0.5">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight font-display">
                  {cleanDisplayName}
                </h2>
                <p className="text-xs text-neutral-500 font-medium">{user?.email || 'user@example.com'}</p>
                {user?.phoneNumber && (
                  <p className="text-[11px] text-neutral-500 font-mono">{user.phoneNumber}</p>
                )}
                <div className="pt-1.5">
                  <button
                    onClick={() => setActiveModal('profile')}
                    className="inline-flex items-center space-x-1.5 bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    <Pencil size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Badges inside profile card */}
          <div className="bg-white rounded-2xl p-3 shadow-2xs border border-purple-100/50 grid grid-cols-4 gap-2 text-center">
            <div 
              onClick={() => setActiveModal('coupons')}
              className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-1.5">
                <Percent size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Exclusive<br />Discounts
              </span>
            </div>

            <div 
              onClick={() => setActiveModal('address')}
              className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1.5">
                <Truck size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Address<br />Book
              </span>
            </div>

            <div 
              onClick={() => setActiveModal('chat')}
              className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1.5">
                <Award size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-800 leading-tight">
                Priority<br />Support
              </span>
            </div>

            <div 
              onClick={() => setActiveModal('coupons')}
              className="flex flex-col items-center p-1 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer"
            >
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
              onClick={() => setActiveModal('orders_All')}
              className="text-xs font-bold text-[#5B4EFF] hover:underline flex items-center space-x-1"
            >
              <span>View All Orders</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center py-1">
            {/* Pending */}
            <div 
              onClick={() => setActiveModal('orders_Pending')}
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
              onClick={() => setActiveModal('orders_Processing')}
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
              onClick={() => setActiveModal('orders_Shipped')}
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
              onClick={() => setActiveModal('orders_Delivered')}
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
              onClick={() => setActiveModal('orders_Cancelled')}
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
                    setActiveModal(item.id);
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

        {/* Sign Out Link */}
        <div className="pt-2 text-center pb-8">
          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors bg-rose-50 px-4 py-2 rounded-xl"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* ==================== MODALS ==================== */}

      {/* 1. EDIT PROFILE MODAL */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-neutral-100 relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5B4EFF] flex items-center justify-center">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Profile Information</h3>
                <p className="text-xs text-neutral-400 font-medium">Update your account details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo selector */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">Avatar Image</label>
                <div className="flex items-center space-x-2 mb-2">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img 
                      key={idx}
                      src={preset} 
                      alt="Preset avatar"
                      onClick={() => setProfilePhoto(preset)}
                      className={`w-11 h-11 rounded-full object-cover cursor-pointer border-2 transition-all ${
                        profilePhoto === preset ? 'border-[#5B4EFF] scale-105 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <input 
                  type="url" 
                  value={profilePhoto} 
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="Or paste custom image URL"
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#5B4EFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#5B4EFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  value={user?.email || ''} 
                  className="w-full text-xs bg-neutral-100 border border-neutral-200 text-neutral-500 rounded-xl px-3.5 py-2.5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={profilePhone} 
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="e.g. +880 1700 000000"
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#5B4EFF]"
                />
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADDRESS BOOK MODAL */}
      {activeModal === 'address' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-neutral-100 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => { setActiveModal(null); setIsAddingAddress(false); }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 pr-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Address Book</h3>
                  <p className="text-xs text-neutral-400 font-medium">Manage delivery addresses</p>
                </div>
              </div>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center space-x-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add New</span>
                </button>
              )}
            </div>

            {isAddingAddress ? (
              <form onSubmit={handleAddAddress} className="space-y-3.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">New Address Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Label Name</label>
                    <input 
                      type="text" 
                      placeholder="Home / Office"
                      value={addrName} 
                      onChange={(e) => setAddrName(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="017XXXXXXXX"
                      value={addrPhone} 
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Street Address</label>
                  <input 
                    type="text" 
                    required
                    placeholder="House/Road/Block details"
                    value={addrStreet} 
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">City / District</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Dhaka, Chittagong, etc."
                      value={addrCity} 
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 mb-1">Postal Code</label>
                    <input 
                      type="text" 
                      placeholder="1212"
                      value={addrPostal} 
                      onChange={(e) => setAddrPostal(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="defAddr"
                    checked={addrDefault} 
                    onChange={(e) => setAddrDefault(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="defAddr" className="text-xs text-neutral-700 font-medium">Set as default shipping address</label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {(!user?.addresses || user.addresses.length === 0) ? (
                  <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <MapPin className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="text-xs font-bold text-neutral-600">No addresses saved yet</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Add an address for quick one-click checkout.</p>
                  </div>
                ) : (
                  user.addresses.map((item) => (
                    <div key={item.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-neutral-900">{item.name}</span>
                          {item.isDefault && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">{item.address}, {item.city} {item.postalCode}</p>
                        {item.phone && <p className="text-[11px] text-neutral-400 font-mono">Phone: {item.phone}</p>}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PAYMENT METHODS MODAL */}
      {activeModal === 'payments' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-neutral-100 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => { setActiveModal(null); setIsAddingPayment(false); }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between border-b border-neutral-100 pb-3 pr-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Payment Methods</h3>
                  <p className="text-xs text-neutral-400 font-medium">Saved wallets & mobile accounts</p>
                </div>
              </div>
              {!isAddingPayment && (
                <button
                  onClick={() => setIsAddingPayment(true)}
                  className="inline-flex items-center space-x-1 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Wallet</span>
                </button>
              )}
            </div>

            {isAddingPayment ? (
              <form onSubmit={handleAddPayment} className="space-y-3.5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">New Payment Details</h4>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Method Type</label>
                  <select 
                    value={payType}
                    onChange={(e: any) => setPayType(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                  >
                    <option value="bKash">bKash Mobile Wallet</option>
                    <option value="Nagad">Nagad Mobile Wallet</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Bank">Bank Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Account / Card Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. 01711223344 or **** **** **** 8899"
                    value={payNumber} 
                    onChange={(e) => setPayNumber(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 mb-1">Account Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Account Name"
                    value={payName} 
                    onChange={(e) => setPayName(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <input 
                    type="checkbox" 
                    id="defPay"
                    checked={payDefault} 
                    onChange={(e) => setPayDefault(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="defPay" className="text-xs text-neutral-700 font-medium">Set as primary payment method</label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    Save Method
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {(!user?.paymentMethods || user.paymentMethods.length === 0) ? (
                  <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <CreditCard className="mx-auto text-neutral-300 mb-2" size={32} />
                    <p className="text-xs font-bold text-neutral-600">No payment methods saved</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Save bKash/Nagad accounts for instant checkout.</p>
                  </div>
                ) : (
                  user.paymentMethods.map((item) => (
                    <div key={item.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs">
                          {item.type}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-neutral-900">{item.accountNumber}</span>
                            {item.isDefault && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-md">Primary</span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500">{item.accountName}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePayment(item.id)}
                        className="text-neutral-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MY REVIEWS MODAL */}
      {activeModal === 'reviews' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-neutral-100 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Star size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">My Product Reviews</h3>
                <p className="text-xs text-neutral-400 font-medium">Your feedback on purchased items</p>
              </div>
            </div>

            {/* Submit new review form */}
            <form onSubmit={handleAddReview} className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-3">
              <h4 className="text-xs font-bold text-neutral-900">Write a New Review</h4>
              <input 
                type="text" 
                required
                placeholder="Product Name (e.g. Silk Punjabi)"
                value={reviewProduct} 
                onChange={(e) => setReviewProduct(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
              />
              
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-neutral-700">Rating:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      type="button" 
                      key={s} 
                      onClick={() => setReviewRating(s)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star size={18} fill={s <= reviewRating ? '#F59E0B' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea 
                required
                rows={2}
                placeholder="Share your experience with the product quality, sizing, and delivery..."
                value={reviewComment} 
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2"
              />

              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Submit Review
              </button>
            </form>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-neutral-700">Past Reviews ({reviews.length})</h4>
              {reviews.map((r) => (
                <div key={r.id} className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900">{r.productName}</span>
                    <span className="text-[10px] text-neutral-400">{r.date}</span>
                  </div>
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="text-amber-400" fill={i < r.rating ? '#F59E0B' : 'none'} />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600 italic">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. WISHLIST MODAL */}
      {activeModal === 'wishlist' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-neutral-100 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Wishlist Items</h3>
                <p className="text-xs text-neutral-400 font-medium">Your saved favorite pieces</p>
              </div>
            </div>

            <div className="space-y-3">
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                  <Heart className="mx-auto text-neutral-300 mb-2" size={32} />
                  <p className="text-xs font-bold text-neutral-600">Wishlist is empty</p>
                  <Link to="/shop" onClick={() => setActiveModal(null)} className="text-xs text-[#5B4EFF] font-bold mt-2 inline-block">
                    Explore Shop
                  </Link>
                </div>
              ) : (
                wishlistProducts.map((p) => (
                  <div key={p.id} className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200/80 flex items-center space-x-3">
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{p.name}</h4>
                      <p className="text-xs font-bold text-[#5B4EFF] mt-0.5">৳{p.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        addItem({
                          ...p,
                          cartItemId: `${p.id}-wish`,
                          quantity: 1
                        });
                        setActiveModal(null);
                        navigate('/cart');
                      }}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold px-3 py-2 rounded-xl shrink-0"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. COUPONS & OFFERS MODAL */}
      {activeModal === 'coupons' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 border border-neutral-100 relative">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5B4EFF] flex items-center justify-center">
                <Ticket size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Coupons & Offers</h3>
                <p className="text-xs text-neutral-400 font-medium">Apply at checkout for discount</p>
              </div>
            </div>

            {copiedCoupon && (
              <div className="bg-emerald-50 text-emerald-700 text-xs font-bold p-2.5 rounded-xl border border-emerald-200 flex items-center space-x-2">
                <Check size={16} />
                <span>Copied code <strong>{copiedCoupon}</strong> to clipboard!</span>
              </div>
            )}

            <div className="space-y-3">
              {INITIAL_COUPONS.map((c) => (
                <div key={c.code} className="bg-gradient-to-r from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
                  <div className="space-y-1 pr-2">
                    <span className="text-[10px] bg-[#5B4EFF] text-white font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{c.discount}</span>
                    <h4 className="text-xs font-bold text-neutral-900 font-mono tracking-wider pt-1">{c.code}</h4>
                    <p className="text-[11px] text-neutral-500 leading-tight">{c.description}</p>
                    <p className="text-[10px] text-neutral-400">Valid till {c.expiry}</p>
                  </div>
                  <button
                    onClick={() => handleCopyCoupon(c.code)}
                    className="inline-flex items-center space-x-1 bg-white hover:bg-neutral-100 text-[#5B4EFF] border border-purple-200 text-xs font-bold px-3 py-2 rounded-xl shrink-0 shadow-2xs transition-colors"
                  >
                    <Copy size={12} />
                    <span>Copy</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. CHAT WITH US MODAL */}
      {activeModal === 'chat' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl flex flex-col h-[520px] border border-neutral-100 relative">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Headphones size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Live Support Chat</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-emerald-600 font-bold">Online Now</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#5B4EFF] text-white rounded-br-xs' 
                      : 'bg-neutral-100 text-neutral-800 rounded-bl-xs'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="pt-2 border-t border-neutral-100 flex items-center space-x-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 text-xs bg-neutral-100 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#5B4EFF]"
              />
              <button
                type="submit"
                className="bg-[#5B4EFF] hover:bg-[#4A3DFF] text-white p-2.5 rounded-xl transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. ORDERS LIST MODAL (Filtered by Status) */}
      {activeModal && activeModal.startsWith('orders_') && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 border border-neutral-100 relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700"
            >
              <X size={18} />
            </button>

            {(() => {
              const filterStatus = activeModal.replace('orders_', '');
              const filteredList = getFilteredOrders(filterStatus);

              return (
                <>
                  <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3 pr-8">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5B4EFF] flex items-center justify-center">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">
                        {filterStatus === 'All' ? 'All Orders' : `${filterStatus} Orders`}
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium">
                        Showing {filteredList.length} order{filteredList.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredList.length === 0 ? (
                      <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                        <ShoppingBasket className="mx-auto text-neutral-300 mb-2" size={36} />
                        <p className="text-xs font-bold text-neutral-600">No {filterStatus} orders found</p>
                        <p className="text-[11px] text-neutral-400 mt-1">When you place orders, they will appear right here.</p>
                      </div>
                    ) : (
                      filteredList.map((ord) => (
                        <div key={ord.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-3">
                          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2">
                            <div>
                              <span className="text-[11px] font-mono font-bold text-neutral-900">#{ord.id.slice(-6).toUpperCase()}</span>
                              <p className="text-[10px] text-neutral-400">Placed on {new Date(ord.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              ord.status?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              ord.status?.toLowerCase() === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              ord.status?.toLowerCase() === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                              ord.status?.toLowerCase() === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {ord.status || 'Pending'}
                            </span>
                          </div>

                          {/* Items Preview */}
                          <div className="space-y-2">
                            {ord.products?.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-3">
                                {item.images?.[0] ? (
                                  <img src={item.images[0]} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-neutral-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-neutral-200 flex items-center justify-center text-[10px]">No img</div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-xs font-medium text-neutral-800 truncate">{item.name}</h5>
                                  <p className="text-[10px] text-neutral-400">Qty: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}</p>
                                </div>
                                <span className="text-xs font-bold text-neutral-900 font-mono">৳{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                            <span className="text-neutral-500 font-medium">Total ({ord.paymentMethod?.toUpperCase()})</span>
                            <span className="font-bold text-[#5B4EFF] font-mono text-sm">৳{ord.total?.toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
}
