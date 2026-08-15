import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useStoreConfigStore } from '../store/useStoreConfigStore';
import SEO from '../components/SEO';

export default function Returns() {
  const navigate = useNavigate();
  const { config } = useStoreConfigStore();

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <SEO title="Return & Replacement Policy | Rare Dreams" />
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RefreshCw size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-serif">Return & Replacement Policy</h1>
              <p className="text-sm text-neutral-500 mt-1">7 Days Easy Return & Replacement Guarantee</p>
            </div>
          </div>

          <div className="space-y-6 text-neutral-700 leading-relaxed text-sm md:text-base">
            <p className="font-medium text-neutral-900">
              If you encounter any sizing issues, defects, or simply change your mind after receiving your Rare Dreams order, you can easily exchange or return the product.
            </p>

            <div className="bg-emerald-50/70 p-6 rounded-2xl border border-emerald-100 space-y-4">
              <h4 className="font-bold text-emerald-900 text-lg">Terms & Conditions for Returns:</h4>
              <ul className="space-y-3 list-disc pl-5 text-emerald-950">
                <li>Notify our customer helpline within <strong>7 days</strong> of package delivery.</li>
                <li>Original brand tags, barcode, and packaging must remain intact and unworn.</li>
                <li>Washed, altered, or used items are not eligible for replacement.</li>
                <li>For size mismatch issues, free doorstep exchange is provided promptly.</li>
              </ul>
            </div>

            <div className="space-y-2 mt-8">
              <h4 className="font-bold text-neutral-900 text-lg">Return Process:</h4>
              <p className="text-neutral-600">
                Send your Order ID and photo of the item to our WhatsApp Helpline (<span className="font-bold font-mono text-neutral-900">{config.whatsappNumber}</span>). Our support team will arrange a doorstep pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
