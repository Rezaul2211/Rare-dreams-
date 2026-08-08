import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Heart, Shirt, Baby, UserCircle2 } from 'lucide-react';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { LazyImage } from '../components/LazyImage';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { ProductCard } from '../components/ProductCard';

const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    title: 'New Season Collection',
    subtitle: 'Discover the latest trends in premium fashion for the modern era.',
    cta: 'Shop Now',
    link: '/shop'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop',
    title: 'Winter Essentials',
    subtitle: 'Stay warm without compromising on style. Explore our new arrivals.',
    cta: 'Explore Collection',
    link: '/shop'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop',
    title: 'Exclusive Accessories',
    subtitle: 'Elevate your look with our handpicked accessories.',
    cta: 'View Accessories',
    link: '/category/Accessories'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // Fetch some products for "New Arrivals"
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'published'),
          limit(4)
        );
        const querySnapshot = await getDocs(q);
        if (isMounted) {
          const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
          setFeaturedProducts(productsData);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching featured products", error);
        if (isMounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Slider */}
      <section className="relative w-full bg-white pt-2 md:pt-6 pb-6 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9] bg-neutral-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 cursor-pointer"
              >
                <Link to={HERO_SLIDES[currentSlide].link}>
                  <img 
                    src={HERO_SLIDES[currentSlide].image} 
                    alt={HERO_SLIDES[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-6 md:p-12">
                    <h2 className="text-white text-2xl md:text-5xl font-bold uppercase tracking-tight max-w-lg shadow-black/50 drop-shadow-md">
                      {HERO_SLIDES[currentSlide].title}
                    </h2>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories (Matching Screenshot 2x2 Grid Style) */}
      <section className="py-12 bg-white w-full">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Featured Collections</span>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-neutral-900 mt-1 font-display">Shop By Category</h2>
          </div>

          {/* 2x2 Grid matching screenshot design */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {[
              {
                title: 'Boys Wear',
                link: '/category/Boys Wear',
                bgColor: 'bg-[#7CA5CB]',
                image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800&auto=format&fit=crop'
              },
              {
                title: 'Girls Wear',
                link: '/category/Girls Wear',
                bgColor: 'bg-[#7CA5CB]',
                image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800&auto=format&fit=crop'
              },
              {
                title: 'Baby Essentials',
                link: '/category/Baby Essentials',
                bgColor: 'bg-[#7CA5CB]',
                image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop'
              },
              {
                title: 'Footwear',
                link: '/category/Footwear',
                bgColor: 'bg-[#7CA5CB]',
                image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop'
              }
            ].map((cat) => (
              <Link 
                key={cat.title} 
                to={cat.link}
                className="group relative rounded-2xl md:rounded-3xl overflow-hidden aspect-[4/4] sm:aspect-[4/3] md:aspect-[1/1] block shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Background color wrapper */}
                <div className={`absolute inset-0 ${cat.bgColor} flex items-center justify-center`}>
                  <img 
                    src={cat.image} 
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Subtle gradient at bottom for high-contrast white text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Centered Overlay Title at bottom like screenshot */}
                <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 text-center z-10 px-2">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md group-hover:scale-105 transition-transform duration-300 font-display">
                    {cat.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals with Stagger Animations */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">New Arrivals</h2>
              <div className="w-12 h-1 bg-black rounded-full"></div>
            </div>
            <Link to="/shop" className="flex items-center text-sm font-bold uppercase hover:text-neutral-500 transition-colors">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center text-neutral-500 py-12">
              No products found. Add some in the admin panel.
            </div>
          )}
          
          <div className="mt-10 text-center md:hidden">
            <Link to="/shop" className="inline-flex items-center justify-center w-full bg-neutral-100 text-black px-6 py-4 rounded-xl text-sm font-bold uppercase tracking-wide hover:bg-neutral-200 transition-colors shadow-sm">
              View All Products
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
