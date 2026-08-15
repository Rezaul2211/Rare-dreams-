import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import SEO from '../components/SEO';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <SEO title="Terms of Service | Rare Dreams" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-8 font-medium text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 border-b border-neutral-100 pb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#5B4EFF] flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-serif">Terms of Service</h1>
              <p className="text-sm text-neutral-500 mt-1">Store Guidelines & Ordering Terms</p>
            </div>
          </div>

          <div className="space-y-4 text-neutral-700 leading-relaxed text-sm md:text-base">
            <p>
              1. Please ensure that you provide an accurate shipping address and active 11-digit mobile number during checkout.
            </p>
            <p>
              2. For Cash on Delivery orders, customers are welcome to inspect outer packaging in presence of the courier rider upon delivery.
            </p>
            <p>
              3. Products are dispatched subject to real-time inventory availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
