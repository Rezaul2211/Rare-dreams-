import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguageStore } from '../store/useLanguageStore';
import { CheckCircle2, ShoppingBag, Phone, MapPin, CreditCard, MessageCircle, ArrowRight, Loader2, PackageCheck } from 'lucide-react';

export default function OrderSuccess() {
  const { language } = useLanguageStore();
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          setOrder({ id: orderSnap.id, ...orderSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching order confirmation:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const whatsappMessage = encodeURIComponent(
    `Hello Rare Dreams! I have placed an order #${id}. Please confirm my order.`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-14 w-full flex-grow">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/80 shadow-xs text-center space-y-4 mb-8">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={48} className="animate-bounce" />
        </div>

        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {language === 'bn' ? 'অর্ডার কনফার্ম ও রিসিভ হয়েছে' : 'Order Confirmed & Received'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-3 font-display">
            {language === 'bn' ? 'আপনার অর্ডারটি সফলভাবে জমা হয়েছে!' : 'Your Order Has Been Successfully Placed!'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-2 leading-relaxed">
            {language === 'bn' ? 'ধন্যবাদ! আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবে এবং পার্সেল ডেলিভারি প্রক্রিয়াজাত করবে।' : 'Thank you! Our representative will contact you shortly and dispatch your parcel.'}
          </p>
        </div>

        <div className="pt-2">
          <div className="inline-block bg-neutral-900 text-white px-5 py-2 rounded-2xl text-xs font-mono font-bold tracking-wider">
            Order ID: #{id}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-neutral-400 text-xs font-bold uppercase tracking-wider">
          <Loader2 size={20} className="animate-spin mr-2" />
          Loading Order Details...
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Products Ordered */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <ShoppingBag size={16} className="text-neutral-700" />
              <span>Order Items ({order.products?.length || 0})</span>
            </h2>

            <div className="divide-y divide-neutral-100">
              {order.products?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-16 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                      {item.images && item.images.length > 0 && (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-neutral-900">{item.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Qty: <span className="font-bold text-black">{item.quantity}</span> {item.selectedSize && `• Size: ${item.selectedSize}`} {item.selectedColor && `• Color: ${item.selectedColor}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-black text-xs sm:text-sm text-neutral-900">
                    ৳ {((item.discountPrice || item.price) * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span>৳ {order.subtotal?.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Delivery Charge</span>
                <span>{order.shipping === 0 ? 'FREE' : `৳ ${order.shipping}`}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Total Amount</span>
                <span>৳ {order.total?.toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Delivery Info */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <MapPin size={14} className="text-neutral-700" /> Delivery Address
              </span>
              <div className="text-xs space-y-1 text-neutral-800">
                <p className="font-bold text-sm text-neutral-900">{order.customerName}</p>
                <p className="font-mono">{order.phone}</p>
                <p className="text-neutral-600">{order.address}, {order.city} {order.postalCode}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <CreditCard size={14} className="text-neutral-700" /> Payment Summary
              </span>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Payment Method</span>
                  <span className="font-black uppercase bg-neutral-100 px-2 py-0.5 rounded text-neutral-900">
                    {order.paymentMethod}
                  </span>
                </div>
                {order.senderNumber && order.senderNumber !== 'N/A' && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Sender Account</span>
                    <span className="font-mono font-bold text-neutral-900">{order.senderNumber}</span>
                  </div>
                )}
                {order.transactionId && order.transactionId !== 'N/A' && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Transaction ID</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {order.transactionId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-neutral-500">Payment Status</span>
                  <span className="font-bold uppercase text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    {order.paymentStatus || 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a 
          href={`https://wa.me/8801954710343?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
        >
          <MessageCircle size={18} />
          <span>{language === 'bn' ? 'হোয়াটসঅ্যাপে সাহায্য নিন' : 'Need Help? Chat on WhatsApp'}</span>
        </a>

        <Link 
          to="/shop" 
          className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
        >
          <span>{language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

