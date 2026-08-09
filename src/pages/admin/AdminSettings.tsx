import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Image, Save, Loader2, Sparkles, Upload, Check, RefreshCw, AlertCircle, Phone, MessageCircle, Share2, CreditCard, ShieldCheck, FileText } from 'lucide-react';
import { useStoreConfigStore, DEFAULT_STORE_CONFIG } from '../../store/useStoreConfigStore';
import { StoreConfig } from '../../types';

export interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}

export interface CategoryImageSetting {
  title: string;
  link: string;
  image: string;
}

export const DEFAULT_HERO_SLIDES: BannerSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    title: 'New Season Collection',
    subtitle: 'Discover the latest trends in premium fashion for the modern era.',
    link: '/shop'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    title: 'Winter Essentials',
    subtitle: 'Stay warm without compromising on style. Explore our new arrivals.',
    link: '/shop'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
    title: 'Exclusive Accessories',
    subtitle: 'Elevate your look with our handpicked accessories.',
    link: '/category/Accessories'
  }
];

export const DEFAULT_CATEGORIES: CategoryImageSetting[] = [
  {
    title: 'Boys Wear',
    link: '/category/Boys Wear',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Girls Wear',
    link: '/category/Girls Wear',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Baby Essentials',
    link: '/category/Baby Essentials',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Footwear',
    link: '/category/Footwear',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop'
  }
];

export default function AdminSettings() {
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_HERO_SLIDES);
  const [categories, setCategories] = useState<CategoryImageSetting[]>(DEFAULT_CATEGORIES);
  const [storeForm, setStoreForm] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { config, updateConfig } = useStoreConfigStore();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'homepage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.banners && Array.isArray(data.banners)) {
            setBanners(data.banners);
          }
          if (data.categories && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch {
        // Fallback to defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (config) {
      setStoreForm(config);
    }
  }, [config]);

  const handleBannerChange = (index: number, field: keyof BannerSlide, value: string) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], [field]: value };
    setBanners(updated);
  };

  const handleCategoryChange = (index: number, field: keyof CategoryImageSetting, value: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  const handleStoreFormChange = (field: keyof StoreConfig, value: string) => {
    setStoreForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'category', index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please select a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress image to fit within Firestore limits (JPEG 0.7 usually results in <200kb)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        if (type === 'banner') {
          handleBannerChange(index, 'image', compressedBase64);
        } else {
          handleCategoryChange(index, 'image', compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      // 1. Save Homepage Banners
      const docRef = doc(db, 'settings', 'homepage');
      await setDoc(docRef, {
        banners,
        categories,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 2. Save Store Config (Social links, WhatsApp, Payment numbers, Licenses)
      await updateConfig(storeForm);

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-neutral-500">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Homepage Customization</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">
            Banner & Category Images
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Upload images from your phone or enter image URLs to update hero slides & category tiles.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-md disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check size={16} className="text-emerald-400" />
              <span>Saved Successfully!</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: HERO BANNERS (3 SLIDES) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
            <Image size={20} className="text-neutral-700" />
            <span>Home Hero Banner Slides (3 Slides)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            These slides auto-rotate and support touch swipe gestures on mobile devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div key={banner.id} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  Slide #{index + 1}
                </span>
                <span className="text-[10px] font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded uppercase">
                  Hero Image
                </span>
              </div>

              {/* Image Preview Box */}
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300">
                <img 
                  src={banner.image || 'https://via.placeholder.com/600x300'} 
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* File Upload Button */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Upload New Image from Device
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'banner', index)}
                  className="block w-full text-xs text-neutral-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
              </div>

              {/* Image URL Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Or Image Web URL
                </label>
                <input
                  type="url"
                  value={banner.image}
                  onChange={(e) => handleBannerChange(index, 'image', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={banner.title}
                  onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  value={banner.subtitle}
                  onChange={(e) => handleBannerChange(index, 'subtitle', e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs text-neutral-700 outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CATEGORY TILES (4 TILES) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-neutral-700" />
            <span>Featured Category Grid Images (4 Categories)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Update category images shown in the 2x2 grid on the home page.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div key={cat.title} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                  {cat.title}
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                  Category #{index + 1}
                </span>
              </div>

              {/* Image Preview Box */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200 border border-neutral-300">
                <img 
                  src={cat.image || 'https://via.placeholder.com/400x300'} 
                  alt={cat.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* File Upload Button */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Upload Image from Device
                </label>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'category', index)}
                  className="block w-full text-xs text-neutral-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
              </div>

              {/* Image URL Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Or Image Web URL
                </label>
                <input
                  type="url"
                  value={cat.image}
                  onChange={(e) => handleCategoryChange(index, 'image', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-mono font-medium outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: STORE CONTACT, WHATSAPP & SOCIAL MEDIA LINKS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4">
          <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
            <Share2 size={20} className="text-emerald-600" />
            <span>Social Links, WhatsApp & Merchant Payment Info</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Update your business numbers, social media links & license details. Changes update on the website immediately!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Group A: Support & Helpline */}
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/80 space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-2">
              <MessageCircle size={16} className="text-emerald-600" />
              <span>WhatsApp & Support Phone</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                WhatsApp Business Number
              </label>
              <input
                type="text"
                value={storeForm.whatsappNumber}
                onChange={(e) => handleStoreFormChange('whatsappNumber', e.target.value)}
                placeholder="+8801712345678"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Helpline Phone Number
              </label>
              <input
                type="text"
                value={storeForm.helplineNumber}
                onChange={(e) => handleStoreFormChange('helplineNumber', e.target.value)}
                placeholder="+880 1712-345678"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Support Email Address
              </label>
              <input
                type="email"
                value={storeForm.supportEmail}
                onChange={(e) => handleStoreFormChange('supportEmail', e.target.value)}
                placeholder="support@raredreams.com.bd"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Group B: Payment Numbers */}
          <div className="bg-pink-50/40 p-5 rounded-2xl border border-pink-100/80 space-y-4">
            <h3 className="text-xs font-black uppercase text-pink-950 tracking-wider flex items-center gap-2">
              <CreditCard size={16} className="text-pink-600" />
              <span>Mobile Banking Merchant Numbers</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                bKash Merchant / Personal Number
              </label>
              <input
                type="text"
                value={storeForm.bkashNumber}
                onChange={(e) => handleStoreFormChange('bkashNumber', e.target.value)}
                placeholder="01712345678"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Nagad Merchant Number
              </label>
              <input
                type="text"
                value={storeForm.nagadNumber}
                onChange={(e) => handleStoreFormChange('nagadNumber', e.target.value)}
                placeholder="01812345678"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Rocket Number
              </label>
              <input
                type="text"
                value={storeForm.rocketNumber}
                onChange={(e) => handleStoreFormChange('rocketNumber', e.target.value)}
                placeholder="01912345678"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Group C: Social Media URLs */}
          <div className="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/80 space-y-4">
            <h3 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-2">
              <Share2 size={16} className="text-blue-600" />
              <span>Social Media Page Links</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={storeForm.facebookUrl}
                onChange={(e) => handleStoreFormChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/raredreamsbd"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={storeForm.instagramUrl}
                onChange={(e) => handleStoreFormChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/raredreamsbd"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={storeForm.youtubeUrl}
                onChange={(e) => handleStoreFormChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/@raredreamsbd"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Group D: Business License & Address */}
          <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/80 space-y-4">
            <h3 className="text-xs font-black uppercase text-amber-950 tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600" />
              <span>Trade License & Office Info</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Trade License Number
              </label>
              <input
                type="text"
                value={storeForm.tradeLicenseNo}
                onChange={(e) => handleStoreFormChange('tradeLicenseNo', e.target.value)}
                placeholder="TRAD/DNCC/012984/2026"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                E-TIN Registration No
              </label>
              <input
                type="text"
                value={storeForm.tinNo}
                onChange={(e) => handleStoreFormChange('tinNo', e.target.value)}
                placeholder="849201948123"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                Store Office / Showroom Address
              </label>
              <input
                type="text"
                value={storeForm.address}
                onChange={(e) => handleStoreFormChange('address', e.target.value)}
                placeholder="Jamuna Future Park, Level 4, Dhaka"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

        </div>
      </div>


      {/* Save Floating Button Mobile */}
      <div className="fixed bottom-4 right-4 z-40 sm:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-2xl flex items-center space-x-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>Save All Settings</span>
        </button>
      </div>
    </div>
  );
}
