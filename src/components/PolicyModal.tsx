import React from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Lock, Award, CheckCircle } from 'lucide-react';
import { useStoreConfigStore } from '../store/useStoreConfigStore';

interface PolicyModalProps {
  type: 'returns' | 'privacy' | 'terms' | 'license' | null;
  onClose: () => void;
}

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  const { config } = useStoreConfigStore();

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 border border-neutral-100 relative max-h-[85vh] overflow-y-auto font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X size={20} />
        </button>

        {type === 'returns' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <RefreshCw size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Return & Replacement Policy</h3>
                <p className="text-xs text-neutral-400 font-medium">৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট গ্যারান্টি</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
              <p className="font-medium">
                রেয়ার ড্রিমস (Rare Dreams) থেকে কেনা যেকোনো পণ্য আপনার হাতে পৌঁছানোর পর কোনো সমস্যা বা পছন্দ না হলে খুব সহজেই পরিবর্তন অথবা রিটার্ন করতে পারবেন।
              </p>

              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
                <h4 className="font-bold text-emerald-900 text-xs">রিটার্ন পাওয়ার শর্তাবলী:</h4>
                <ul className="space-y-1.5 list-disc pl-4 text-emerald-950">
                  <li>পণ্য হাতে পাওয়ার <strong>৭ দিনের মধ্যে</strong> আমাদের হেল্পলাইনে অবহিত করতে হবে।</li>
                  <li>পোশাক বা পণ্যের আন-প্যাকড অরিজিনাল ট্যাগ ও ব্যাগ অক্ষত থাকতে হবে।</li>
                  <li>ব্যবহার করা বা ধোয়া পোশাক রিটার্নের আওতায় পড়বে না।</li>
                  <li>সাইজজনিত সমস্যা থাকলে একদম ফ্রী-তে হোম ডেলিভারিতে এক্সচেঞ্জ দেওয়া হয়।</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-neutral-900">রিটার্ন প্রক্রিয়া:</h4>
                <p>
                  আমাদের হোয়াটসঅ্যাপ হেল্পলাইনে (<span className="font-bold font-mono">{config.whatsappNumber}</span>) আপনার অর্ডার আইডি ও রিটার্নের ছবি পাঠালে আমাদের প্রতিনিধি আপনার বাসা থেকে পিকআপের ব্যবস্থা করবে।
                </p>
              </div>
            </div>
          </div>
        )}

        {type === 'license' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Business Verification & License</h3>
                <p className="text-xs text-neutral-400 font-medium">সরকারি ট্রেড লাইসেন্স ও ই-কমার্স অনুমোদন</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
              <p className="font-medium">
                রেয়ার ড্রিমস একটি ১০০% সরকারি ট্রেড লাইসেন্স প্রাপ্ত ও ই-কমার্স অ্যাসোসিয়েশন নিবন্ধিত প্রিমিয়াম ব্র্যান্ড।
              </p>

              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-2.5 font-mono">
                <div className="flex justify-between items-center border-b border-neutral-200/60 pb-1.5">
                  <span className="text-neutral-500 text-[11px] font-sans font-bold">Brand Name:</span>
                  <span className="font-bold text-neutral-900 font-sans">Rare Dreams Bangladesh</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-200/60 pb-1.5">
                  <span className="text-neutral-500 text-[11px] font-sans font-bold">Trade License No:</span>
                  <span className="font-bold text-amber-700">{config.tradeLicenseNo || 'TRAD/DNCC/012984/2026'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-neutral-200/60 pb-1.5">
                  <span className="text-neutral-500 text-[11px] font-sans font-bold">E-TIN Registration:</span>
                  <span className="font-bold text-neutral-800">{config.tinNo || '849201948123'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-[11px] font-sans font-bold">DBID ID:</span>
                  <span className="font-bold text-emerald-700">{config.dbidNo || 'DBID-2026-884129'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <CheckCircle size={18} className="shrink-0" />
                <span className="font-medium">সকল ডিজিটাল লেনদেন ও বিকাশ/নগদ মার্চেন্ট ভেরিফাইড।</span>
              </div>
            </div>
          </div>
        )}

        {type === 'privacy' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Privacy Policy</h3>
                <p className="text-xs text-neutral-400 font-medium">আপনার ব্যক্তিগত তথ্যের গোপনীয়তা সুরক্ষা</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-700 leading-relaxed">
              <p>
                রেয়ার ড্রিমস গ্রাহকের ব্যক্তিগত তথ্যের সর্বোচ্চ সুরক্ষা সুনিশ্চিত করে। আপনার নাম, মোবাইল নাম্বার এবং ডেলিভারি ঠিকানা শুধুমাত্র আপনার অর্ডার সম্পন্ন করার কাজে ব্যবহৃত হয়।
              </p>
              <p>
                কোনো অবস্থাতেই গ্রাহকের কোনো তথ্য তৃতীয় কোনো ব্যক্তি বা থার্ড পার্টি প্রতিষ্ঠানের কাছে বিক্রি বা শেয়ার করা হয় না।
              </p>
            </div>
          </div>
        )}

        {type === 'terms' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 border-b border-neutral-100 pb-3 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#5B4EFF] flex items-center justify-center">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Terms of Service</h3>
                <p className="text-xs text-neutral-400 font-medium">শর্তাবলী ও নির্দেশিকা</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-700 leading-relaxed">
              <p>
                ১. ওয়েবসাইট থেকে অর্ডার করার সময় সঠিক ঠিকানা ও ফোন নাম্বার প্রদান করুন।
              </p>
              <p>
                ২. ক্যাশ অন ডেলিভারিতে অর্ডার করার ক্ষেত্রে ডেলিভারি ম্যানের সামনে প্যাকেট চেক করে নেয়ার সুযোগ রয়েছে।
              </p>
              <p>
                ৩. স্টক সাপেক্ষে প্রডাক্ট ডেলিভারি প্রদান করা হবে।
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="bg-neutral-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
