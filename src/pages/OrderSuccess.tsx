import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-32 px-4 text-center">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500">
        <CheckCircle size={48} />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-4">Order Confirmed</h1>
      <p className="text-neutral-500 mb-8 max-w-md">
        Thank you for your purchase. Your order <span className="font-bold text-black">#{id}</span> has been received and is being processed.
      </p>
      <Link 
        to="/shop" 
        className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
