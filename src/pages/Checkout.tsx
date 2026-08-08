import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { ShieldCheck, ChevronLeft } from 'lucide-react';

export default function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod' as 'cod' | 'stripe' | 'bKash' | 'nagad',
  });

  const subtotal = getSubtotal();
  const shipping = subtotal > 2000 ? 0 : 60;
  const total = subtotal + (subtotal > 0 ? shipping : 0);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;

      const orderData = {
        id: orderId,
        userId: user?.uid || 'guest',
        customerName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        products: items,
        subtotal,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        status: 'Pending',
        createdAt: serverTimestamp(),
      };

      if (formData.paymentMethod === 'stripe') {
        // Save pending order first
        await setDoc(orderRef, orderData);
        
        // Call backend to create checkout session
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            orderId,
            successUrl: `${window.location.origin}/order-success/${orderId}`,
            cancelUrl: `${window.location.origin}/checkout`,
          }),
        });

        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error(data.error || 'Failed to initialize payment');
        }
      } else {
        // Handle COD, bKash, Nagad
        await setDoc(orderRef, orderData);
        clearCart();
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error("Error placing order", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-grow">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Return to Cart
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Checkout Form */}
        <div className="w-full lg:w-3/5 space-y-6">
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900">Checkout</h1>
          
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Contact & Delivery Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</span>
                <span>Contact & Delivery Information</span>
              </h2>

              {!user ? (
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 mb-5 flex items-center justify-between">
                  <p className="text-xs text-amber-900 font-medium">
                    Checking out as <strong className="font-bold">Guest</strong>. No password needed to order!
                  </p>
                  <Link to="/login" className="text-xs text-amber-950 font-black underline shrink-0 ml-2">Sign In</Link>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="e.g. Tanvir" 
                    required 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="e.g. Rahman" 
                    required 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Phone Number (Required for Delivery)</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="01700000000" 
                    required 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span>
                <span>Delivery Address</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Full Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    placeholder="House/Road No., Area, Thana" 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">City / District</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="e.g. Dhaka" 
                      required 
                      value={formData.city} 
                      onChange={handleChange} 
                      className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Postal Code</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      placeholder="1212" 
                      required 
                      value={formData.postalCode} 
                      onChange={handleChange} 
                      className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-black rounded-2xl text-sm transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-4 flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px]">3</span>
                <span>Select Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  formData.paymentMethod === 'cod' ? 'border-black bg-neutral-50 ring-2 ring-black/5 shadow-xs' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">Cash on Delivery</span>
                    <span className="text-[11px] text-neutral-500">Pay when receiving parcel</span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  formData.paymentMethod === 'bKash' ? 'border-pink-600 bg-pink-50/50 ring-2 ring-pink-500/10 shadow-xs' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="bKash" checked={formData.paymentMethod === 'bKash'} onChange={handleChange} className="w-4 h-4 text-pink-600 focus:ring-pink-600" />
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">bKash Merchant</span>
                    <span className="text-[11px] text-neutral-500">Mobile Money Transfer</span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  formData.paymentMethod === 'nagad' ? 'border-orange-600 bg-orange-50/50 ring-2 ring-orange-500/10 shadow-xs' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={handleChange} className="w-4 h-4 text-orange-600 focus:ring-orange-600" />
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">Nagad Wallet</span>
                    <span className="text-[11px] text-neutral-500">Mobile Money Transfer</span>
                  </div>
                </label>

                <label className={`p-4 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                  formData.paymentMethod === 'stripe' ? 'border-black bg-neutral-50 ring-2 ring-black/5 shadow-xs' : 'border-neutral-200 hover:border-neutral-300'
                }`}>
                  <input type="radio" name="paymentMethod" value="stripe" checked={formData.paymentMethod === 'stripe'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <div>
                    <span className="font-bold text-sm text-neutral-900 block">Credit Card (Stripe)</span>
                    <span className="text-[11px] text-neutral-500">Visa / Mastercard / Amex</span>
                  </div>
                </label>
              </div>
              
              <div className="mt-5 flex items-center space-x-2 text-[11px] text-neutral-500 font-medium">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>All transactions are secure & encrypted with SSL certificate.</span>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary Card */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-md sticky top-24">
            <h2 className="text-base font-black uppercase tracking-wider text-neutral-900 mb-6 pb-4 border-b border-neutral-100">Order Summary ({items.length})</h2>
            
            <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-14 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
                        {item.images && item.images.length > 0 && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 leading-snug line-clamp-1">{item.name}</p>
                      <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                        {item.selectedSize && `Size: ${item.selectedSize}`} {item.selectedColor && `• Color: ${item.selectedColor}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-neutral-900 shrink-0">৳ {(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-neutral-100 text-sm mb-6">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-bold text-neutral-900">৳ {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charge</span>
                <span className="font-bold text-neutral-900">
                  {shipping === 0 ? <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span> : `৳ ${shipping.toFixed(0)}`}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8 pt-4 border-t border-neutral-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">Total Payable</span>
                <span className="text-2xl font-black text-neutral-900">৳ {total.toFixed(0)}</span>
              </div>
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-lg uppercase">
                {formData.paymentMethod.toUpperCase()}
              </span>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Confirming Order...' : 'Confirm & Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
