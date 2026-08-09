import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Package, 
  Plus, 
  ClipboardList, 
  BarChart3, 
  Ticket, 
  MoreVertical, 
  ChevronDown, 
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 1248,
    totalSales: 89540,
    totalCustomers: 932,
    totalProducts: 256,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products count
        const productsSnap = await getDocs(collection(db, 'products'));
        const productCount = productsSnap.size || 256;

        // Fetch recent orders
        let ordersData: any[] = [];
        try {
          const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(4));
          const ordersSnap = await getDocs(q);
          ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch {
          const simpleQ = query(collection(db, 'orders'), limit(4));
          const ordersSnap = await getDocs(simpleQ);
          ordersData = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        if (ordersData.length > 0) {
          setRecentOrders(ordersData);
        } else {
          // Default mock matching screenshot 2
          setRecentOrders([
            {
              id: 'RD-7845',
              customerName: 'Nihad Hasan',
              total: 2450,
              status: 'Pending',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop'
            },
            {
              id: 'RD-7844',
              customerName: 'Jannatul Ferdous',
              total: 1880,
              status: 'Processing',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=120&auto=format&fit=crop'
            },
            {
              id: 'RD-7843',
              customerName: 'Al Amin',
              total: 3250,
              status: 'Shipped',
              avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120&auto=format&fit=crop'
            },
            {
              id: 'RD-7842',
              customerName: 'Sadia Islam',
              total: 2150,
              status: 'Delivered',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop'
            }
          ]);
        }

        setStats(prev => ({
          ...prev,
          totalProducts: productCount
        }));
      } catch (err) {
        console.error("Dashboard fetch error", err);
      }
    };

    fetchDashboardData();
  }, []);

  const cleanAdminName = (user?.displayName || 'Rezaul Karim')
    .replace(/\(Admin\)/gi, '')
    .trim() || 'Rezaul Karim';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. WELCOME BANNER (Matching Screenshot 2) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 max-w-xl">
          <span className="text-sm font-medium text-white/90">Welcome back,</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight mt-0.5 flex items-center gap-2">
            <span>{cleanAdminName}</span>
            <span className="inline-block animate-bounce">👋</span>
          </h1>
          <div className="mt-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/20 shadow-xs">
              <ShieldCheck size={14} className="text-amber-300" />
              <span>Store Administrator</span>
            </span>
          </div>
        </div>

        {/* Floating 3D illustration graphics on right */}
        <div className="absolute right-4 bottom-0 top-0 hidden md:flex items-center justify-end pointer-events-none opacity-90 pr-6">
          <div className="relative w-48 h-40">
            <div className="absolute -top-2 right-4 w-28 h-28 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center transform rotate-6">
              <ShoppingBag size={48} className="text-purple-200" />
            </div>
            <div className="absolute bottom-2 right-12 w-24 h-24 bg-indigo-900/30 rounded-2xl backdrop-blur-md border border-white/20 shadow-xl flex items-center justify-center transform -rotate-12">
              <BarChart3 size={36} className="text-amber-300" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI 4 STATS CARDS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ShoppingBag size={22} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-500">Total Orders</span>
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight mt-0.5">
              {stats.totalOrders.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 18.2%</span>
              <span className="text-neutral-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-500">Total Sales</span>
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight mt-0.5">
              ৳ {stats.totalSales.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 24.5%</span>
              <span className="text-neutral-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Users size={22} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-500">Total Customers</span>
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight mt-0.5">
              {stats.totalCustomers.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 12.1%</span>
              <span className="text-neutral-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Package size={22} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-500">Total Products</span>
            <div className="text-2xl font-black text-neutral-900 font-mono tracking-tight mt-0.5">
              {stats.totalProducts.toLocaleString()}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
              <span>↑ 7.8%</span>
              <span className="text-neutral-400 font-normal">vs last 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW (Order Status Donut & Sales Overview Line Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Donut Chart Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Order Status</h3>
            <button className="text-neutral-400 hover:text-neutral-700">
              <MoreVertical size={18} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Pending arc 25.6% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="16" strokeDasharray="64 175" strokeDashoffset="0" />
                {/* Processing arc 32.9% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="16" strokeDasharray="78 161" strokeDashoffset="-64" />
                {/* Shipped arc 26.4% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="16" strokeDasharray="63 176" strokeDashoffset="-142" />
                {/* Delivered arc 15.1% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#8B5CF6" strokeWidth="16" strokeDasharray="36 203" strokeDashoffset="-205" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-neutral-900 font-mono">1,248</span>
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-2.5 w-full">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="font-semibold text-neutral-700">Pending</span>
                </div>
                <span className="font-bold text-neutral-900 font-mono">320 (25.6%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="font-semibold text-neutral-700">Processing</span>
                </div>
                <span className="font-bold text-neutral-900 font-mono">410 (32.9%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-neutral-700">Shipped</span>
                </div>
                <span className="font-bold text-neutral-900 font-mono">330 (26.4%)</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="font-semibold text-neutral-700">Delivered</span>
                </div>
                <span className="font-bold text-neutral-900 font-mono">188 (15.1%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview Line Chart Card */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Sales Overview</h3>
            <button className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1.5 rounded-xl flex items-center space-x-1 hover:bg-neutral-200 transition-colors">
              <span>This Week</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {/* SVG Line Chart */}
          <div className="pt-2">
            <div className="h-44 w-full relative">
              {/* Y Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-neutral-400 font-mono pointer-events-none">
                <div className="border-b border-neutral-100 pb-0.5">40K</div>
                <div className="border-b border-neutral-100 pb-0.5">30K</div>
                <div className="border-b border-neutral-100 pb-0.5">20K</div>
                <div className="border-b border-neutral-100 pb-0.5">10K</div>
                <div>0</div>
              </div>

              {/* Chart SVG Curve */}
              <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled gradient under line */}
                <path
                  d="M 10 90 Q 50 40, 90 70 T 170 30 T 250 50 T 290 20 L 290 120 L 10 120 Z"
                  fill="url(#salesGradient)"
                />

                {/* Main line */}
                <path
                  d="M 10 90 Q 50 40, 90 70 T 170 30 T 250 50 T 290 20"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                <circle cx="10" cy="90" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="50" cy="40" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="90" cy="70" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="130" cy="50" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="170" cy="30" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="210" cy="55" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="250" cy="50" r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="290" cy="20" r="5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] text-neutral-400 font-medium pt-2">
              <span>Aug 1</span>
              <span>Aug 3</span>
              <span>Aug 5</span>
              <span>Aug 7</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ORDERS LIST */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Recent Orders</h3>
          <Link 
            to="/admin/orders" 
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((ord, idx) => {
            const statusClass = 
              ord.status?.toLowerCase() === 'delivered' ? 'bg-purple-100 text-purple-800' :
              ord.status?.toLowerCase() === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
              ord.status?.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
              'bg-amber-100 text-amber-800';

            return (
              <div 
                key={ord.id || idx} 
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-neutral-50 transition-colors border border-neutral-100/60"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={ord.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop`} 
                    alt={ord.customerName} 
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-neutral-200"
                  />
                  <div>
                    <span className="text-xs font-black text-neutral-900 font-mono block">
                      #{ord.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-neutral-500 font-medium">
                      Customer: {ord.customerName || ord.name || 'User'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs font-black text-neutral-900 font-mono">
                    ৳ {(ord.total || ord.subtotal || 2450).toLocaleString()}
                  </span>
                  <span className={`px-3 py-1 rounded-xl text-xs font-bold ${statusClass}`}>
                    {ord.status || 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-tight">Quick Actions</h3>
        <div className="grid grid-cols-5 gap-3 sm:gap-4 text-center">
          {/* Add Product */}
          <Link
            to="/admin/products/new"
            className="bg-white p-3.5 sm:p-4 rounded-3xl border border-neutral-100 shadow-2xs hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center mb-2">
              <Plus size={22} />
            </div>
            <span className="text-xs font-bold text-neutral-800">Add Product</span>
          </Link>

          {/* Orders */}
          <Link
            to="/admin/orders"
            className="bg-white p-3.5 sm:p-4 rounded-3xl border border-neutral-100 shadow-2xs hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mb-2">
              <ClipboardList size={22} />
            </div>
            <span className="text-xs font-bold text-neutral-800">Orders</span>
          </Link>

          {/* Customers */}
          <Link
            to="/admin/customers"
            className="bg-white p-3.5 sm:p-4 rounded-3xl border border-neutral-100 shadow-2xs hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center mb-2">
              <Users size={22} />
            </div>
            <span className="text-xs font-bold text-neutral-800">Customers</span>
          </Link>

          {/* Reports */}
          <Link
            to="/admin/settings"
            className="bg-white p-3.5 sm:p-4 rounded-3xl border border-neutral-100 shadow-2xs hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center mb-2">
              <BarChart3 size={22} />
            </div>
            <span className="text-xs font-bold text-neutral-800">Reports</span>
          </Link>

          {/* Coupons */}
          <Link
            to="/admin/settings"
            className="bg-white p-3.5 sm:p-4 rounded-3xl border border-neutral-100 shadow-2xs hover:shadow-md transition-all group flex flex-col items-center"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors flex items-center justify-center mb-2">
              <Ticket size={22} />
            </div>
            <span className="text-xs font-bold text-neutral-800">Coupons</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
