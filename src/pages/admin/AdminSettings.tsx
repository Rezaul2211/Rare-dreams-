import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Image as ImageIcon, Save, Loader2, Sparkles, Upload, Check, RefreshCw, AlertCircle, Phone, MessageCircle, Share2, CreditCard, ShieldCheck, FileText, Plus, Trash2, Search, Globe, ExternalLink, Copy } from 'lucide-react';
import { useStoreConfigStore, DEFAULT_STORE_CONFIG } from '../../store/useStoreConfigStore';
import { useCategoryStore, CategoryItem } from '../../store/useCategoryStore';
import { StoreConfig } from '../../types';

export interface BannerSlide {
  id: number;
  image: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  link: string;
  tag?: string;
  theme?: 'dark' | 'pink' | 'olive' | 'light';
  tagColor?: string;
  titleColor?: string;
  accentColor?: string;
  subtitleColor?: string;
  buttonBg?: string;
  buttonText?: string;
}

export interface CategoryImageSetting {
  title: string;
  link: string;
  image: string;
}

export const DEFAULT_HERO_SLIDES: BannerSlide[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=2070&auto=format&fit=crop',
    tag: 'NEW COLLECTION 2026',
    title: 'Elevate Your',
    titleAccent: 'Everyday Style',
    subtitle: 'Timeless looks. Premium quality.\nMade for you.',
    link: '/category/Men',
    theme: 'dark',
    tagColor: '#C69A4C',
    titleColor: '#FFFFFF',
    accentColor: '#C69A4C',
    subtitleColor: '#F4F4F5',
    buttonBg: '#FFFFFF',
    buttonText: '#0A0A0A'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    tag: 'NEW COLLECTION 2026',
    title: 'Redefine Your',
    titleAccent: 'Every Occasion',
    subtitle: 'Versatile styles for every moment.\nCrafted for comfort. Designed for you.',
    link: '/category/Women',
    theme: 'olive',
    tagColor: '#556B4E',
    titleColor: '#1C1917',
    accentColor: '#556B4E',
    subtitleColor: '#2D3748',
    buttonBg: '#4E6247',
    buttonText: '#FFFFFF'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2070&auto=format&fit=crop',
    tag: 'LUXURY ACCESSORIES',
    title: 'The Finest Details',
    titleAccent: 'Make The Difference',
    subtitle: 'Premium accessories to\ncomplete your style.',
    link: '/category/Accessories',
    theme: 'pink',
    tagColor: '#B76E79',
    titleColor: '#1C1917',
    accentColor: '#B76E79',
    subtitleColor: '#374151',
    buttonBg: '#B36270',
    buttonText: '#FFFFFF'
  }
];

export const DEFAULT_CATEGORIES: CategoryImageSetting[] = [
  {
    title: 'Men',
    link: '/category/Men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Women',
    link: '/category/Women',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Kids',
    link: '/category/Kids',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop'
  },
  {
    title: 'Accessories',
    link: '/category/Accessories',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'
  }
];

export default function AdminSettings() {
  const [banners, setBanners] = useState<BannerSlide[]>(DEFAULT_HERO_SLIDES);
  const { categories: storeCategories, saveCategories, fetchCategories } = useCategoryStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [storeForm, setStoreForm] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<{ type: string; index: number } | null>(null);

  const { config, updateConfig } = useStoreConfigStore();

  useEffect(() => {
    fetchCategories();
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'homepage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
            const merged = data.banners.map((b: any, idx: number) => {
              const def = DEFAULT_HERO_SLIDES[idx] || DEFAULT_HERO_SLIDES[0];
              const isBadText = b.title === 'New Season Collection' || b.title === 'Winter Essentials' || b.tag === 'NEW COLLECTION 2025' || (b.title === 'Redefine Your' && b.tag === 'NEW COLLECTION 2025');
              return {
                ...b,
                title: isBadText ? def.title : b.title,
                titleAccent: isBadText ? def.titleAccent : b.titleAccent,
                subtitle: isBadText ? def.subtitle : b.subtitle,
                tag: isBadText ? def.tag : b.tag,
              };
            });
            setBanners(merged);
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
    if (storeCategories && storeCategories.length > 0) {
      setCategories(storeCategories);
    }
  }, [storeCategories]);

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

  const handleCategoryChange = (index: number, field: keyof CategoryItem, value: string) => {
    const updated = [...categories];
    const updatedCat = { ...updated[index], [field]: value };
    if (field === 'title') {
      updatedCat.link = `/category/${encodeURIComponent(value)}`;
    }
    updated[index] = updatedCat;
    setCategories(updated);
  };

  const handleAddCategory = () => {
    const nextNum = categories.length + 1;
    const title = `New Category ${nextNum}`;
    const newCat: CategoryItem = {
      id: crypto.randomUUID(),
      title,
      link: `/category/${encodeURIComponent(title)}`,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop'
    };
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (index: number) => {
    if (categories.length <= 1) {
      alert("At least one category must remain.");
      return;
    }
    if (confirm(`Are you sure you want to delete category "${categories[index].title}"?`)) {
      setCategories(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleStoreFormChange = (field: keyof StoreConfig, value: string) => {
    setStoreForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'category', index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("File size exceeds 15MB limit. Please select a smaller image.");
      return;
    }

    setUploadingIndex({ type, index });

    const reader = new FileReader();
    reader.onerror = () => {
      alert("Failed to read image file.");
      setUploadingIndex(null);
    };

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setUploadingIndex(null);
        return;
      }

      const img = new window.Image();
      img.onerror = () => {
        alert("Failed to process image. Please try another image.");
        setUploadingIndex(null);
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.80);

            if (type === 'banner') {
              handleBannerChange(index, 'image', compressedBase64);
            } else {
              handleCategoryChange(index, 'image', compressedBase64);
            }
          }
        } catch (err) {
          console.error("Canvas processing error:", err);
          // Fallback to raw data url if canvas fails
          if (type === 'banner') {
            handleBannerChange(index, 'image', dataUrl);
          } else {
            handleCategoryChange(index, 'image', dataUrl);
          }
        } finally {
          setUploadingIndex(null);
        }
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  };

  const handleResetCategories = () => {
    if (confirm("Reset categories to standard 4 clean categories (Men, Women, Kids, Accessories)? Old custom categories will be cleared.")) {
      const standard: CategoryItem[] = [
        {
          id: 'men',
          title: 'Men',
          link: '/category/Men',
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'women',
          title: 'Women',
          link: '/category/Women',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'kids',
          title: 'Kids',
          link: '/category/Kids',
          image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=800&auto=format&fit=crop'
        },
        {
          id: 'accessories',
          title: 'Accessories',
          link: '/category/Accessories',
          image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'
        }
      ];
      setCategories(standard);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      // 1. Immediately cache banners locally for instant 0ms load
      try {
        localStorage.setItem('rare_dreams_hero_slides', JSON.stringify(banners));
      } catch {}

      // 2. Save Homepage Banners & Categories to Firestore
      const docRef = doc(db, 'settings', 'homepage');
      await setDoc(docRef, {
        banners,
        categories,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 3. Save Category Store
      await saveCategories(categories);

      // 4. Save Store Config (Social links, WhatsApp, Payment numbers, Licenses)
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
            <ImageIcon size={20} className="text-neutral-700" />
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

              {/* Tag Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Tag / Eyebrow (e.g. NEW COLLECTION 2025)
                </label>
                <input
                  type="text"
                  value={banner.tag || ''}
                  onChange={(e) => handleBannerChange(index, 'tag', e.target.value)}
                  placeholder="NEW COLLECTION 2025"
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Main Title (Line 1)
                  </label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => handleBannerChange(index, 'title', e.target.value)}
                    placeholder="Elevate Your"
                    className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                    Accent Title (Line 2)
                  </label>
                  <input
                    type="text"
                    value={banner.titleAccent || ''}
                    onChange={(e) => handleBannerChange(index, 'titleAccent', e.target.value)}
                    placeholder="Everyday Style"
                    className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
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

              {/* Link Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Button Link
                </label>
                <input
                  type="text"
                  value={banner.link || '/shop'}
                  onChange={(e) => handleBannerChange(index, 'link', e.target.value)}
                  placeholder="/shop or /category/Men"
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CATEGORY TILES & MANAGER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-4">
          <div>
            <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-neutral-700" />
              <span>Manage Categories ({categories.length} Total)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Add new categories, edit category names, change images, or delete unwanted categories. Changes update live across the website!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetCategories}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-neutral-100 text-neutral-700 hover:text-neutral-900 text-xs font-bold uppercase rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer shrink-0 border border-neutral-300"
              title="Reset to 4 Standard Clean Categories"
            >
              <RefreshCw size={14} />
              <span>Reset to Standard 4</span>
            </button>
            <button
              type="button"
              onClick={handleAddCategory}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div key={cat.id || index} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 space-y-4 relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-900 truncate max-w-[150px]">
                  {cat.title}
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(index)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors rounded hover:bg-red-50 cursor-pointer ml-1"
                    title="Delete Category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Category Name Input */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={cat.title}
                  onChange={(e) => handleCategoryChange(index, 'title', e.target.value)}
                  className="w-full bg-white border border-neutral-300 px-3 py-2 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                />
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
                  value={cat.image || ''}
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

      {/* SECTION 4: SEO & GOOGLE SEARCH RANKING (Google Search & SEO Settings) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
        <div className="border-b border-neutral-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              <span>Google Search & SEO Indexing (Search Engine Ranking)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Configure meta tags, structured product schemas, and Google Search Console verification so your products appear directly on Google search results.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-full border border-blue-200 w-fit">
            Google Rich Results Ready
          </span>
        </div>

        {/* Live Google Search Preview Box */}
        <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200 space-y-2">
          <div className="flex items-center space-x-2 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            <Globe size={14} className="text-neutral-400" />
            <span>Google Search Preview (Google Search Preview)</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-2xs space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-neutral-600 font-mono truncate">
              <span className="text-emerald-700 font-semibold">{storeForm.canonicalDomain || 'https://raredreams.com.bd'}</span>
              <span>›</span>
              <span>shop</span>
            </div>
            <h3 className="text-base text-blue-700 hover:underline font-medium cursor-pointer line-clamp-1">
              {storeForm.metaTitle || 'Rare Dreams | Exclusive Luxury Kids & Family Fashion Bangladesh'}
            </h3>
            <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
              {storeForm.metaDescription || 'Shop premium, designer kids wear, boys panjabi, girls lehenga, baby essentials & footwear at Rare Dreams Bangladesh. 100% genuine fabrics, fast cash on delivery nationwide.'}
            </p>
          </div>
        </div>

        {/* SEO Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                Website Meta Title (Main Site Title)
              </label>
              <input
                type="text"
                value={storeForm.metaTitle || ''}
                onChange={(e) => handleStoreFormChange('metaTitle', e.target.value)}
                placeholder="Rare Dreams | Exclusive Luxury Kids & Family Fashion Bangladesh"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Recommended: 50-60 characters</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                Canonical Domain URL (Main Domain)
              </label>
              <input
                type="url"
                value={storeForm.canonicalDomain || ''}
                onChange={(e) => handleStoreFormChange('canonicalDomain', e.target.value)}
                placeholder="https://raredreams.com.bd"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Your live custom domain (e.g. https://raredreams.com.bd)</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                Google Search Console Verification Token (Google Verification Code)
              </label>
              <input
                type="text"
                value={storeForm.googleSiteVerification || ''}
                onChange={(e) => handleStoreFormChange('googleSiteVerification', e.target.value)}
                placeholder="e.g. AbC123dEf_xYz789..."
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs font-mono text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">Content code from HTML tag provided by Google Search Console</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                Meta Description (Search Result Description)
              </label>
              <textarea
                rows={3}
                value={storeForm.metaDescription || ''}
                onChange={(e) => handleStoreFormChange('metaDescription', e.target.value)}
                placeholder="Shop premium, designer kids wear, boys panjabi, girls lehenga, baby essentials & footwear at Rare Dreams Bangladesh. 100% genuine fabrics, fast cash on delivery nationwide."
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-0.5">
                <span>Recommended: 140-160 characters</span>
                <span className={(storeForm.metaDescription?.length || 0) > 160 ? 'text-amber-600 font-bold' : ''}>
                  {storeForm.metaDescription?.length || 0} / 160
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-700 mb-1">
                Target SEO Keywords (Target Keywords)
              </label>
              <textarea
                rows={3}
                value={storeForm.metaKeywords || ''}
                onChange={(e) => handleStoreFormChange('metaKeywords', e.target.value)}
                placeholder="Rare Dreams, baby clothes Bangladesh, boys punjabi, girls dress, footwear Dhaka, online shopping BD, cash on delivery"
                className="w-full bg-white border border-neutral-300 px-3.5 py-2.5 rounded-xl text-xs text-neutral-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">Comma-separated search terms that customers use on Google</span>
            </div>
          </div>
        </div>

        {/* Live Sitemap & Robots.txt Links */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
            <Globe size={15} className="text-blue-600" />
            <span>Search Engine Crawling URLs (Google Bot Indexing Links)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Sitemap XML</span>
                <span className="font-mono font-bold text-neutral-800">/sitemap.xml</span>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                title="View Sitemap"
              >
                <ExternalLink size={16} />
              </a>
            </div>

            <div className="bg-white p-3 rounded-xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase block">Robots.txt</span>
                <span className="font-mono font-bold text-neutral-800">/robots.txt</span>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                title="View Robots.txt"
              >
                <ExternalLink size={16} />
              </a>
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
