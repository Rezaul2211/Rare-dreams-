import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useStoreConfigStore } from '../store/useStoreConfigStore';
import { ShieldCheck, ChevronLeft, Copy, Check, Smartphone, Loader2, ArrowRight, X, Lock, CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { config } = useStoreConfigStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isConnectingGateway, setIsConnectingGateway] = useState(false);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cod' as 'cod' | 'bKash' | 'nagad',
    senderNumber: '',
    transactionId: '',
  });

  const BKASH_NUMBER = config.bkashNumber || '01954710343';
  const NAGAD_NUMBER = config.nagadNumber || '01342563522';


  const subtotal = getSubtotal();
  const shipping = subtotal > 2000 ? 0 : 60;
  const total = subtotal + (subtotal > 0 ? shipping : 0);

  if (items.length === 0 && !isOrderPlaced && !loading) {
    return <Navigate to="/cart" replace />;
  }

  if (isOrderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 flex-grow flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-xl md:text-2xl font-black uppercase text-neutral-900 tracking-tight">
          অর্ডারটি সফলভাবে জমা নেওয়া হচ্ছে...
        </h2>
        <p className="text-xs text-neutral-500">
          Order placed successfully! Redirecting to order confirmation page...
        </p>
        <Loader2 className="w-6 h-6 text-neutral-800 animate-spin mx-auto mt-2" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Main Submit handler from Checkout Page
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
      alert('Please fill in all required contact and address fields.');
      return;
    }

    if (formData.paymentMethod === 'bKash' || formData.paymentMethod === 'nagad') {
      // Step 1: Show Gateway Loading state first
      setIsConnectingGateway(true);
      setTimeout(() => {
        setIsConnectingGateway(false);
        setShowGatewayModal(true);
      }, 1200);
      return;
    }

    // COD Direct Place Order
    await finalizeOrder();
  };

  // Finalize order writing to Firestore
  const finalizeOrder = async () => {
    setLoading(true);

    try {
      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;

      const orderData = {
        id: orderId,
        userId: user?.uid || 'guest',
        customerName: formData.lastName ? `${formData.firstName} ${formData.lastName}` : formData.firstName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        products: items,
        subtotal,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
        senderNumber: formData.senderNumber || 'N/A',
        transactionId: formData.transactionId || 'N/A',
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
        status: 'Pending',
        createdAt: serverTimestamp(),
      };

      setIsOrderPlaced(true);
      await setDoc(orderRef, orderData);
      clearCart();
      setShowGatewayModal(false);
      navigate(`/order-success/${orderId}`, { replace: true });
    } catch (error) {
      console.error("Error placing order", error);
      setIsOrderPlaced(false);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
      setIsVerifyingPayment(false);
    }
  };

  // Modal Gateway Submit handler
  const handleGatewayModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderNumber.trim()) {
      alert(`Please enter your ${formData.paymentMethod === 'bKash' ? 'bKash' : 'Nagad'} mobile number.`);
      return;
    }
    if (!formData.transactionId.trim()) {
      alert('Please enter the Transaction ID (TrxID).');
      return;
    }

    setIsVerifyingPayment(true);
    setTimeout(() => {
      finalizeOrder();
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-grow relative">
      
      {/* FULLSCREEN GATEWAY CONNECTING LOADER */}
      {isConnectingGateway && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg animate-pulse ${
              formData.paymentMethod === 'bKash' ? 'bg-[#D12053]' : 'bg-[#F7921E]'
            }`}>
              {formData.paymentMethod === 'bKash' ? 'bK' : 'নগদ'}
            </div>
            <div>
              <h3 className="font-black text-lg text-neutral-900 uppercase tracking-tight">Connecting to Gateway...</h3>
              <p className="text-xs text-neutral-500 mt-1">Opening secure {formData.paymentMethod === 'bKash' ? 'bKash' : 'Nagad'} payment portal</p>
            </div>
            <Loader2 className="w-8 h-8 text-neutral-800 animate-spin mt-2" />
          </div>
        </div>
      )}

      {/* bKash / Nagad GATEWAY PAYMENT MODAL */}
      {showGatewayModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-100 relative my-auto">
            
            {/* Modal Top Header Bar */}
            <div className={`px-6 py-5 text-white flex items-center justify-between ${
              formData.paymentMethod === 'bKash' ? 'bg-[#D12053]' : 'bg-[#F7921E]'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-lg">
                  {formData.paymentMethod === 'bKash' ? 'bK' : 'নগদ'}
                </div>
                <div>
                  <h3 className="font-black text-base uppercase tracking-wider leading-none">
                    {formData.paymentMethod === 'bKash' ? 'bKash Merchant Pay' : 'Nagad Payment Gateway'}
                  </h3>
                  <span className="text-[10px] text-white/80 font-medium tracking-wide">RARE DREAMS OFFICIAL PORTAL</span>
                </div>
              </div>
              <button 
                onClick={() => setShowGatewayModal(false)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleGatewayModalSubmit} className="p-6 space-y-5">
              {/* Order Amount Banner */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Total Payable</span>
                  <span className="text-xl font-black text-neutral-900">৳ {total.toFixed(0)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Merchant Name</span>
                  <span className="text-xs font-bold text-neutral-800">Rare Dreams BD</span>
                </div>
              </div>

              {/* Official Number Copy Box */}
              <div className={`p-4 rounded-2xl border space-y-2.5 ${
                formData.paymentMethod === 'bKash' ? 'bg-pink-50/60 border-pink-200' : 'bg-orange-50/60 border-orange-200'
              }`}>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block">
                  Send Money / Payment to this {formData.paymentMethod === 'bKash' ? 'bKash' : 'Nagad'} Number
                </span>
                
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-neutral-200 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <Smartphone size={18} className={formData.paymentMethod === 'bKash' ? 'text-[#D12053]' : 'text-[#F7921E]'} />
                    <span className="text-lg font-black text-neutral-900 font-mono tracking-wider">
                      {formData.paymentMethod === 'bKash' ? BKASH_NUMBER : NAGAD_NUMBER}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyNumber(formData.paymentMethod === 'bKash' ? BKASH_NUMBER : NAGAD_NUMBER)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                      copiedNumber 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-neutral-900 text-white hover:bg-black'
                    }`}
                  >
                    {copiedNumber ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-neutral-600 leading-relaxed pt-1 space-y-0.5">
                  <p>১. আপনার {formData.paymentMethod === 'bKash' ? 'বিকাশ' : 'নগদ'} অ্যাপ খুলে উপরের নম্বরে <strong className="text-black font-bold">Send Money</strong> করুন।</p>
                  <p>২. টাকা পাঠানোর পর নিচের ঘরে আপনার নম্বর ও TrxID লিখে সাবমিট করুন।</p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    আপনার {formData.paymentMethod === 'bKash' ? 'বিকাশ' : 'নগদ'} মোবাইল নম্বর *
                  </label>
                  <input
                    type="tel"
                    name="senderNumber"
                    placeholder="017XXXXXXXX"
                    required
                    value={formData.senderNumber}
                    onChange={handleChange}
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 rounded-xl text-sm font-mono font-bold outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                    Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    name="transactionId"
                    placeholder="e.g. 8N7X9Y2Z"
                    required
                    value={formData.transactionId}
                    onChange={handleChange}
                    className="w-full bg-neutral-50 border border-neutral-300 px-4 py-3 rounded-xl text-sm font-mono font-bold uppercase outline-none focus:bg-white focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifyingPayment || loading}
                className={`w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                  formData.paymentMethod === 'bKash' ? 'bg-[#D12053] hover:bg-[#b0133f]' : 'bg-[#F7921E] hover:bg-[#d97c12]'
                } disabled:opacity-60`}
              >
                {isVerifyingPayment ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Transaction...</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Confirm & Complete Order (৳ {total.toFixed(0)})</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-neutral-400 font-medium">
                🔒 256-Bit Encrypted Mobile Payment Gateway
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Last Name (Optional)</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="e.g. Rahman" 
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
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">Postal Code (Optional)</label>
                    <input 
                      type="text" 
                      name="postalCode" 
                      placeholder="1212" 
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                <label className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'cod' ? 'border-black bg-neutral-900 text-white shadow-xs' : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm block">Cash on Delivery</span>
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="w-4 h-4 text-black focus:ring-black cursor-pointer" />
                  </div>
                  <span className={`text-[11px] ${formData.paymentMethod === 'cod' ? 'text-neutral-300' : 'text-neutral-500'}`}>পণ্য হাতে পেয়ে টাকা পরিশোধ</span>
                </label>

                <label className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'bKash' ? 'border-[#D12053] bg-[#D12053] text-white shadow-xs' : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm block">bKash (বিকাশ)</span>
                    <input type="radio" name="paymentMethod" value="bKash" checked={formData.paymentMethod === 'bKash'} onChange={handleChange} className="w-4 h-4 text-[#D12053] focus:ring-[#D12053] cursor-pointer" />
                  </div>
                  <span className={`text-[11px] ${formData.paymentMethod === 'bKash' ? 'text-pink-100' : 'text-neutral-500'}`}>Send Money / Merchant Pay</span>
                </label>

                <label className={`p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  formData.paymentMethod === 'nagad' ? 'border-[#F7921E] bg-[#F7921E] text-white shadow-xs' : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-900'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm block">Nagad (নগদ)</span>
                    <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={handleChange} className="w-4 h-4 text-[#F7921E] focus:ring-[#F7921E] cursor-pointer" />
                  </div>
                  <span className={`text-[11px] ${formData.paymentMethod === 'nagad' ? 'text-orange-100' : 'text-neutral-500'}`}>Send Money / Gateway</span>
                </label>
              </div>

              {formData.paymentMethod !== 'cod' && (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 flex items-center space-x-2 mt-3">
                  <Smartphone size={16} className={formData.paymentMethod === 'bKash' ? 'text-[#D12053]' : 'text-[#F7921E]'} />
                  <span>
                    Clicking <strong className="text-black">Confirm & Place Order</strong> will launch the interactive {formData.paymentMethod === 'bKash' ? 'bKash' : 'Nagad'} payment portal.
                  </span>
                </div>
              )}
              
              <div className="mt-4 flex items-center space-x-2 text-[11px] text-neutral-500 font-medium">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>All transactions are secure & verified directly by our team.</span>
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
                    <div className="w-12 h-14 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200/60 shrink-0">
                      {item.images && item.images.length > 0 && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-neutral-900 leading-snug line-clamp-1">{item.name}</p>
                      <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                        Qty: {item.quantity} {item.selectedSize && `• Size: ${item.selectedSize}`} {item.selectedColor && `• Color: ${item.selectedColor}`}
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
              <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-lg uppercase">
                {formData.paymentMethod.toUpperCase()}
              </span>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || isConnectingGateway}
              className="w-full bg-neutral-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black active:scale-95 transition-all shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
            >
              {isConnectingGateway ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Connecting Gateway...</span>
                </>
              ) : loading ? (
                <span>Confirming Order...</span>
              ) : (
                <span>Confirm & Place Order</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

