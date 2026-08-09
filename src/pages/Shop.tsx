import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { SlidersHorizontal, ArrowUpDown, Sparkles, Search, X } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';
import { ProductSkeleton } from '../components/ProductSkeleton';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

export default function Shop() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'discount'>('featured');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch all published products first to handle flexible category matching across DB variations
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'published')
        );
        
        const querySnapshot = await getDocs(q);
        let productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Product));
        
        if (category) {
          const target = category.toLowerCase().trim();
          productsData = productsData.filter(p => {
            if (!p.category) return false;
            const c = p.category.toLowerCase().trim();
            if (c === target) return true;
            if (target.includes('boy') && (c.includes('boy') || c.includes('kids'))) return true;
            if (target.includes('girl') && (c.includes('girl') || c.includes('kids'))) return true;
            if (target.includes('baby') && (c.includes('baby') || c.includes('kids'))) return true;
            if ((target.includes('footwear') || target.includes('shoe')) && (c.includes('footwear') || c.includes('shoe') || c.includes('sneaker'))) return true;
            if (target.includes('men') && !target.includes('women') && c.includes('men')) return true;
            if (target.includes('women') && c.includes('women')) return true;
            return c.includes(target) || target.includes(c);
          });
        }

        if (searchQuery.trim()) {
          const term = searchQuery.toLowerCase().trim();
          productsData = productsData.filter(p => {
            const nameMatch = p.name?.toLowerCase().includes(term);
            const catMatch = p.category?.toLowerCase().includes(term);
            const subcatMatch = p.subcategory?.toLowerCase().includes(term);
            const descMatch = p.description?.toLowerCase().includes(term);
            return nameMatch || catMatch || subcatMatch || descMatch;
          });
        }
        
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, searchQuery]);

  // Sort products based on selection
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
    return 0; // featured
  });

  // Category Banner Data
  const getCategoryDetails = () => {
    const catLower = category ? category.toLowerCase() : '';

    if (catLower.includes('boy')) {
      return {
        title: "Boys Wear Collection",
        description: "Durable denim, jackets, casual polo shirts and energetic everyday apparel for boys.",
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1600&auto=format&fit=crop",
        tag: "Boys Apparel"
      };
    }
    if (catLower.includes('girl')) {
      return {
        title: "Girls Wear Collection",
        description: "Floral ruffle dresses, princess pleated skirts, and delightful cotton everyday outfits.",
        image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1600&auto=format&fit=crop",
        tag: "Girls Apparel"
      };
    }
    if (catLower.includes('baby')) {
      return {
        title: "Baby Essentials Collection",
        description: "Organic cotton onesies, swaddle blankets, baby bottles and gentle grooming kits.",
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1600&auto=format&fit=crop",
        tag: "Baby & Newborn"
      };
    }
    if (catLower.includes('footwear') || catLower.includes('shoe')) {
      return {
        title: "Footwear Collection",
        description: "Lightweight velcro cushion sneakers, flexible leather loafers and daily active footwear.",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1600&auto=format&fit=crop",
        tag: "Shoes & Sneakers"
      };
    }
    if (catLower.includes('men') && !catLower.includes('women')) {
      return {
        title: "Men's Collection",
        description: "Sophisticated outerwear, tailored suit jackets, and cotton polo shirts.",
        image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=1600&auto=format&fit=crop",
        tag: "Men's Fashion"
      };
    }
    if (catLower.includes('women')) {
      return {
        title: "Women's Collection",
        description: "Timeless elegance, summer flow dresses, silk blouses, and luxury accessories.",
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=1600&auto=format&fit=crop",
        tag: "Women's Fashion"
      };
    }
    return {
      title: category ? `${category} Collection` : "All Collections",
      description: "Discover our full range of premium apparel, baby essentials, and footwear.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop",
      tag: "Complete Catalogue"
    };
  };

  const categoryDetails = getCategoryDetails();

  return (
    <div className="w-full pb-16 bg-[#FAFAFA]">
      <SEO 
        title={category ? `${categoryDetails.title} | Rare Dreams` : (searchQuery ? `Search: "${searchQuery}" | Rare Dreams` : 'Shop All Collections | Rare Dreams')}
        description={categoryDetails.description}
        image={categoryDetails.image}
        keywords={`${category || 'Shop'}, kids wear, boys apparel, girls dresses, baby essentials, footwear, Rare Dreams`}
      />

      {/* Category Hero Header Banner */}
      <div className="relative bg-neutral-900 text-white min-h-[260px] md:min-h-[320px] flex items-center justify-center overflow-hidden mb-8">
        <img 
          src={categoryDetails.image} 
          alt={categoryDetails.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/30" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10 py-12">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-4">
            <Sparkles size={12} className="text-amber-300" />
            <span>{categoryDetails.tag}</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-3 drop-shadow-md">
            {categoryDetails.title}
          </h1>
          <p className="text-neutral-300 text-xs md:text-base max-w-2xl mx-auto leading-relaxed">
            {categoryDetails.description}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Category Navigation Pills Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white p-2 md:p-3 rounded-2xl border border-neutral-200/80 shadow-xs mb-8 gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { label: 'All Products', path: '/shop', cat: undefined },
              { label: 'Boys Wear', path: '/category/Boys Wear', cat: 'Boys Wear' },
              { label: 'Girls Wear', path: '/category/Girls Wear', cat: 'Girls Wear' },
              { label: 'Baby Essentials', path: '/category/Baby Essentials', cat: 'Baby Essentials' },
              { label: 'Footwear', path: '/category/Footwear', cat: 'Footwear' },
              { label: "Men's Collection", path: '/category/Men', cat: 'Men' },
              { label: "Women's Collection", path: '/category/Women', cat: 'Women' },
            ].map((tab) => {
              const isActive = (category === tab.cat) || (!category && !tab.cat);
              return (
                <Link
                  key={tab.label}
                  to={tab.path}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center space-x-1.5 shrink-0 ${
                    isActive 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center justify-between md:justify-end gap-3 px-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
            <span className="text-xs text-neutral-500 font-semibold uppercase tracking-wider whitespace-nowrap">
              {sortedProducts.length} Items
            </span>
            <div className="flex items-center space-x-2 bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200">
              <ArrowUpDown size={14} className="text-neutral-500" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-neutral-800 uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Search Filter Banner */}
        {searchQuery && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 p-4 rounded-2xl mb-8">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Search size={16} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Search results for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-[11px] text-amber-700/80">
                  Found {sortedProducts.length} matching item{sortedProducts.length === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('search');
                newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="bg-white hover:bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-amber-200 flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              <X size={14} />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-neutral-200/80 shadow-xs max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
              <SlidersHorizontal size={24} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2 text-neutral-900">No products found</h3>
            <p className="text-neutral-500 text-sm mb-6">There are currently no published products in the {category ? `${category}` : ''} category.</p>
            <Link to="/shop" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors">
              Explore All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
