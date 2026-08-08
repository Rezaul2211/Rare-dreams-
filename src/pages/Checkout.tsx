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
  const shipping = subtotal > 200 ? 0 : 15;
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
    <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow bg-white">
      <div className="mb-8">
        <Link to="/cart" className="flex items-center text-sm font-medium uppercase tracking-wider text-neutral-500 hover:text-black transition-colors">
          <ChevronLeft size={16} className="mr-1" /> Return to Cart
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Checkout Form */}
        <div className="w-full lg:w-3/5">
          <h1 className="text-3xl font-bold uppercase tracking-tighter mb-8">Checkout</h1>
          
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
            {/* Contact */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Contact Information</h2>
              {!user && (
                <p className="text-sm text-neutral-500 mb-4">
                  Already have an account? <Link to="/login" className="text-black underline font-medium">Log in</Link> for faster checkout.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input type="text" name="firstName" placeholder="First Name" required value={formData.firstName} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black" />
                </div>
                <div>
                  <input type="text" name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black" />
                </div>
                <div className="col-span-2">
                  <input type="tel" name="phone" placeholder="Phone Number" required value={formData.phone} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black" />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <input type="text" name="address" placeholder="Address" required value={formData.address} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="city" placeholder="City" required value={formData.city} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black" />
                  <input type="text" name="postalCode" placeholder="Postal Code" required value={formData.postalCode} onChange={handleChange} className="w-full border border-neutral-300 px-4 py-3 outline-none focus:border-black" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Payment Method</h2>
              <div className="space-y-3 border border-neutral-300 p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="stripe" checked={formData.paymentMethod === 'stripe'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <span className="font-medium text-sm">Credit Card (Stripe)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <span className="font-medium text-sm">Cash on Delivery</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="bKash" checked={formData.paymentMethod === 'bKash'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <span className="font-medium text-sm">bKash Mobile Money</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black" />
                  <span className="font-medium text-sm">Nagad Mobile Money</span>
                </label>
              </div>
              
              <div className="mt-4 flex items-center space-x-2 text-xs text-neutral-500 uppercase tracking-wider">
                <ShieldCheck size={16} />
                <span>All transactions are secure and encrypted.</span>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-2/5">
          <div className="bg-neutral-50 p-8 border border-neutral-200 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-16 bg-neutral-200 overflow-hidden">
                        {item.images && item.images.length > 0 && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="absolute -top-2 -right-2 bg-neutral-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-neutral-500">{item.selectedSize} / {item.selectedColor}</p>
                    </div>
                  </div>
                  <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-neutral-200 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8 pt-6 border-t border-neutral-200">
              <span className="text-sm font-bold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
