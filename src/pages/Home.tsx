import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { ProductCard } from '../components/ProductCard';
import { DEFAULT_HERO_SLIDES, DEFAULT_CATEGORIES, BannerSlide, CategoryImageSetting } from './admin/AdminSettings';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<BannerSlide[]>(DEFAULT_HERO_SLIDES);
  const [categoriesList, setCategoriesList] = useState<CategoryImageSetting[]>(DEFAULT_CATEGORIES);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Homepage Customization Settings from Firestore
  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'homepage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
            setHeroSlides(data.banners);
          }
          if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategoriesList(data.categories);
          }
        }
      } catch {
        // Fallback to default hero slides & categories
      }
    };
    fetchHomepageSettings();
  }, []);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  // Fetch published products
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'published')
        );
        const querySnapshot = await getDocs(q);
        if (isMounted) {
          const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setAllProducts(productsData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching products", error);
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  // Filter products by category for section rows
  const getProductsByCategory = (catTitle: string) => {
    const target = catTitle.toLowerCase().trim();
    return allProducts.filter(p => {
      if (!p.category) return false;
      const c = p.category.toLowerCase().trim();
      if (c === target) return true;
      if (target.includes('boy') && (c.includes('boy') || c.includes('kids'))) return true;
      if (target.includes('girl') && (c.includes('girl') || c.includes('kids'))) return true;
      if (target.includes('baby') && (c.includes('baby') || c.includes('kids'))) return true;
      if ((target.includes('footwear') || target.includes('shoe')) && (c.includes('footwear') || c.includes('shoe') || c.includes('sneaker'))) return true;
      return c.includes(target) || target.includes(c);
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Slider with Touch Swipe & Reduced Gap */}
      <section className="relative w-full bg-white pt-2 md:pt-4 pb-2 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-neutral-100 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x < -50 || velocity.x < -300) {
                    nextSlide();
                  } else if (offset.x > 50 || velocity.x > 300) {
                    prevSlide();
                  }
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
              >
                <Link to={heroSlides[currentSlide]?.link || '/shop'} className="block w-full h-full">
                  <img 
                    src={heroSlides[currentSlide]?.image} 
                    alt={heroSlides[currentSlide]?.title}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-12">
                    <h2 className="text-white text-xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight max-w-xl drop-shadow-md font-display">
                      {heroSlides[currentSlide]?.title}
                    </h2>
                    {heroSlides[currentSlide]?.subtitle && (
                      <p className="text-neutral-200 text-xs sm:text-sm md:text-base max-w-lg mt-1 line-clamp-2">
                        {heroSlides[currentSlide]?.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Manual Slide Navigation Buttons */}
            <button 
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>

            <button 
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all flex items-center justify-center cursor-pointer shadow-sm"
              aria-label="Next slide"
            >
              <ChevronRight size={20} />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex space-x-1.5">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (2x2 Grid with Clean Gap) */}
      <section className="pt-4 pb-8 bg-white w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Featured Collections</span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-neutral-900 font-display">
                Shop By Category
              </h2>
            </div>
            <Link 
              to="/shop" 
              className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-neutral-600 transition-colors flex items-center gap-1 bg-neutral-100 px-3 py-1.5 rounded-xl"
            >
              <span>See All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {categoriesList.map((cat) => (
              <Link 
                key={cat.title} 
                to={cat.link || `/category/${cat.title}`}
                className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[4/3] md:aspect-[1/1] block shadow-xs hover:shadow-xl transition-all duration-300 bg-neutral-200"
              >
                <img 
                  src={cat.image} 
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Overlay Title */}
                <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 text-center z-10 px-2">
                  <h3 className="text-base sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md group-hover:scale-105 transition-transform duration-300 font-display">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS BY CATEGORY SECTIONS (Replacing old "View All" single list) */}
      <div className="space-y-8 pb-12 bg-[#FAFAFA] pt-8">
        {categoriesList.map((cat) => {
          const catProducts = getProductsByCategory(cat.title);
          if (!loading && catProducts.length === 0) return null; // Skip empty categories

          return (
            <section key={cat.title} className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 w-full">
              <div className="flex justify-between items-end mb-4 border-b border-neutral-200/80 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Category</span>
                  <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-display">
                    {cat.title}
                  </h2>
                </div>

                <Link 
                  to={cat.link || `/category/${cat.title}`} 
                  className="text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-black transition-colors flex items-center gap-1 bg-white border border-neutral-200 px-3 py-1.5 rounded-xl shadow-2xs hover:shadow-xs"
                >
                  <span>See All</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {[...Array(4)].map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {catProducts.slice(0, 4).map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

        {/* ALL NEW ARRIVALS SECTION */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 w-full pt-4">
          <div className="flex justify-between items-end mb-4 border-b border-neutral-200/80 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Fresh Stock</span>
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-display">
                New Arrivals
              </h2>
            </div>

            <Link 
              to="/shop" 
              className="text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-neutral-800 transition-colors flex items-center gap-1 px-4 py-2 rounded-xl shadow-xs"
            >
              <span>See All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : allProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {allProducts.slice(0, 8).map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-neutral-500 py-12 bg-white rounded-3xl border border-neutral-200">
              No products found in store catalogue yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

