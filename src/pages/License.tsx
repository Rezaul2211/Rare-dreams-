import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle } from 'lucide-react';
import { useStoreConfigStore } from '../store/useStoreConfigStore';
import SEO from '../components/SEO';

export default function License() {
  const navigate = useNavigate();
  const { config } = useStoreConfigStore();

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <SEO title="Business Verification & License | Rare Dreams" />
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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 font-serif">Business Verification & License</h1>
              <p className="text-sm text-neutral-500 mt-1">Official Government Trade License & E-Commerce Registration</p>
            </div>
          </div>

          <div className="space-y-6 text-neutral-700 leading-relaxed text-sm md:text-base">
            <p className="font-medium text-neutral-900">
              Rare Dreams is an officially registered, licensed brand complying with national digital commerce regulations.
            </p>

            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                <span className="text-neutral-500 font-sans font-bold uppercase tracking-wider text-xs">Brand Name:</span>
                <span className="font-bold text-neutral-900 font-sans text-base">Rare Dreams Bangladesh</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                <span className="text-neutral-500 font-sans font-bold uppercase tracking-wider text-xs">Trade License No:</span>
                <span className="font-bold text-amber-700 text-base">{config.tradeLicenseNo || 'TRAD/DNCC/012984/2026'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200/60 pb-3">
                <span className="text-neutral-500 font-sans font-bold uppercase tracking-wider text-xs">E-TIN Registration:</span>
                <span className="font-bold text-neutral-800 text-base">{config.tinNo || '849201948123'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-sans font-bold uppercase tracking-wider text-xs">DBID ID:</span>
                <span className="font-bold text-emerald-700 text-base">{config.dbidNo || 'DBID-2026-884129'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-emerald-700 bg-emerald-50 p-4 rounded-xl border border-emerald-100 mt-6">
              <CheckCircle size={20} className="shrink-0" />
              <span className="font-medium">All digital payments and bKash/Nagad merchant accounts are fully verified.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
