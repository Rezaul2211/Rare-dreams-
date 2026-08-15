import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import SEO from '../components/SEO';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <SEO title="Privacy Policy | Rare Dreams" />
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
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Lock size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-serif">Privacy Policy</h1>
              <p className="text-sm text-neutral-500 mt-1">Customer Data Protection & Privacy</p>
            </div>
          </div>

          <div className="space-y-4 text-neutral-700 leading-relaxed text-sm md:text-base">
            <p>
              Rare Dreams ensures the highest standards of data security and customer privacy. Your name, contact number, and shipping address are strictly used for order processing and delivery fulfillment.
            </p>
            <p>
              We never sell, rent, or share personal user data with third-party advertising networks or external vendors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
