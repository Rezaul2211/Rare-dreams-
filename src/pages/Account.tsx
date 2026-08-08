import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Order } from '../types';
import { LogOut, ShieldCheck, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Account() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        let ordersData: Order[] = [];
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        } catch (queryErr) {
          console.warn("Composite query failed, falling back to simple query", queryErr);
          const simpleQ = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
          );
          const simpleSnapshot = await getDocs(simpleQ);
          ordersData = simpleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          ordersData.sort((a, b) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          });
        }
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders", error);
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
    return <div className="flex justify-center py-32">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 w-full flex-grow">
      {/* User Header Profile Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 md:p-8 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-md shrink-0">
              {(user?.displayName || user?.email || 'U')[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{user?.displayName || 'My Account'}</h1>
                {user?.role === 'admin' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    <ShieldCheck size={13} className="text-amber-600" />
                    <span>Admin</span>
                  </span>
                )}
              </div>
              <p className="text-neutral-500 text-sm mt-0.5 font-medium">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm group"
              >
                <LayoutDashboard size={16} className="text-amber-400" />
                <span>Admin Panel</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 border border-neutral-200 hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors text-neutral-700 shrink-0"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-neutral-900">Order History</h2>
            <span className="text-xs text-neutral-500 font-medium">{orders.length} orders found</span>
          </div>
          
          {orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-neutral-200/80 shadow-sm text-neutral-500">
              <p className="font-bold text-base mb-1 text-neutral-800">No order history yet</p>
              <p className="text-sm text-neutral-400 mb-6">When you place orders, they will appear here.</p>
              <Link to="/shop" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div key={order.id} className="border border-neutral-200/80 p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-neutral-100 pb-4 mb-4 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-0.5">Order ID</p>
                      <p className="text-sm font-bold text-neutral-900">#{order.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-3 py-1 bg-neutral-100 text-neutral-800 text-xs font-bold uppercase tracking-wider rounded-full">
                        {order.status || 'Pending'}
                      </span>
                      <span className="font-bold text-lg text-neutral-900">
                        ৳ {(order.totalAmount || order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {order.products?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <div className="w-14 h-16 bg-neutral-100 overflow-hidden shrink-0 rounded-xl">
                          {item.images && item.images.length > 0 && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-neutral-900 truncate">{item.name}</p>
                          <p className="text-xs text-neutral-500">Qty: {item.quantity || 1} &bull; ৳ {item.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

