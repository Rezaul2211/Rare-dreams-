import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useFlyToCart } from '../context/FlyToCartContext';
import { ChevronRight, Share2, MessageCircle, Zap, HeadphonesIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { LazyImage } from '../components/LazyImage';
import { ProductDetailSkeleton } from '../components/ProductDetailSkeleton';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/ProductSkeleton';
import SEO from '../components/SEO';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'contact'>('description');
  
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  const { animateAddToCart } = useFlyToCart();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          setSelectedImage(0);
          setQuantity(1);
          if (data.sizeOptions?.length) setSelectedSize(data.sizeOptions[0]);
          if (data.colorOptions?.length) setSelectedColor(data.colorOptions[0]);
        }
      } catch (error) {
        console.error("Error fetching product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch Recommended Products algorithmically by Category
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!product) return;
      try {
        setLoadingRecommended(true);
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'published')
        );
        const querySnapshot = await getDocs(q);
        const all: Product[] = [];
        querySnapshot.forEach((doc) => {
          if (doc.id !== product.id) {
            all.push({ id: doc.id, ...doc.data() } as Product);
          }
        });

        // Same category priority
        const sameCat = all.filter(p => p.category?.toLowerCase() === product.category?.toLowerCase());
        const otherCat = all.filter(p => p.category?.toLowerCase() !== product.category?.toLowerCase());

        // Algorithmic merge: show same category first, fill up to 4 items with other products
        const combined = [...sameCat, ...otherCat].slice(0, 4);
        setRecommendedProducts(combined);
      } catch (err) {
        console.error("Error loading recommended products", err);
      } finally {
        setLoadingRecommended(false);
      }
    };

    fetchRecommended();
  }, [product]);

  const handleAddToCart = (e?: React.MouseEvent<HTMLElement>) => {
    if (!product) return;
    
    // Validate selections if options exist
    if (product.sizeOptions?.length && !selectedSize) {
      alert("Please select a size");
      return;
    }
    if (product.colorOptions?.length && !selectedColor) {
      alert("Please select a color");
      return;
    }

    if (e) {
      animateAddToCart(product, e, {
        size: selectedSize,
        color: selectedColor,
        quantity,
      });
    } else {
      addItem({
        ...product,
        cartItemId: crypto.randomUUID(),
        selectedSize,
        selectedColor,
        quantity,
      });
    }
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full">
      <SEO 
        title={`${product.name} - ৳${product.price.toFixed(0)}`}
        description={product.description?.substring(0, 160) || `Buy ${product.name} online at Rare Dreams. Category: ${product.category}. Premium quality and fast nationwide delivery.`}
        image={product.images?.[0]}
        type="product"
        keywords={`${product.name}, ${product.category}, ${product.subcategory || ''}, Rare Dreams, online shopping Bangladesh`}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider text-neutral-500 mb-8">
        <span className="hover:text-black cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <ChevronRight size={14} />
        <span className="hover:text-black cursor-pointer" onClick={() => navigate(`/category/${product.category}`)}>{product.category}</span>
        <ChevronRight size={14} />
        <span className="text-black">{product.name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Images */}
        <div className="w-full lg:w-1/2 flex flex-col">
          {/* Main Image */}
          <div className="w-full relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm mb-4">
            {product.images && product.images.length > 0 ? (
              <LazyImage 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover object-center"
                containerClassName="w-full h-full bg-neutral-100"
              />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400">No image available</div>
            )}
          </div>
          
          {/* Thumbnails below */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 hide-scrollbar">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={clsx(
                    "w-20 h-24 shrink-0 rounded-xl overflow-hidden transition-all shadow-sm",
                    selectedImage === idx ? "ring-2 ring-black ring-offset-2" : "opacity-70 hover:opacity-100"
                  )}
                >
                  <LazyImage src={img} alt="" className="w-full h-full object-cover" containerClassName="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="w-full lg:w-1/2 flex flex-col pt-2">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 mb-2">{product.name}</h1>
            <div className="flex items-center text-sm text-neutral-500 mb-4 space-x-4">
              <span>Category: <span className="font-medium text-neutral-900">{product.category}</span></span>
              <span>Brand: <span className="font-medium text-neutral-900">Rare Dreams</span></span>
            </div>
            
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl font-bold">৳ {product.price.toFixed(2)}</span>
              {product.comparePrice && (
                <span className="text-base text-neutral-400 line-through">৳ {product.comparePrice.toFixed(2)}</span>
              )}
            </div>

            {/* Short Description Box */}
            <div className="bg-neutral-50 rounded-2xl p-4 text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6 border border-neutral-200/70 shadow-2xs">
              {product.description?.substring(0, 160)}...
            </div>

            <div className="space-y-6 mb-6">
              {/* Colors */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Color: <span className="text-black">{selectedColor}</span></span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={clsx(
                        "px-5 py-2.5 text-xs font-bold rounded-2xl transition-all border shadow-2xs cursor-pointer",
                        selectedColor === color 
                          ? "border-black bg-neutral-900 text-white shadow-xs ring-2 ring-black/5" 
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">Size: <span className="text-black">{selectedSize}</span></span>
                  <button className="text-xs font-medium underline text-neutral-500 hover:text-black cursor-pointer">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={clsx(
                        "min-w-12 h-12 px-3.5 flex items-center justify-center text-xs font-bold rounded-2xl transition-all border shadow-2xs cursor-pointer",
                        selectedSize === size 
                          ? "border-black bg-neutral-900 text-white shadow-xs ring-2 ring-black/5" 
                          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

              {/* Quantity & Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="flex items-center border border-neutral-200/90 rounded-2xl h-12 w-32 shrink-0 overflow-hidden bg-white shadow-2xs">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 flex justify-center items-center hover:bg-neutral-50 transition-colors text-lg font-bold text-neutral-700 cursor-pointer"
                  >-</button>
                  <span className="flex-1 text-center font-bold text-sm border-x border-neutral-100">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="flex-1 flex justify-center items-center hover:bg-neutral-50 transition-colors text-lg font-bold text-neutral-700 cursor-pointer"
                  >+</button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={(e) => handleAddToCart(e)}
                  disabled={product.stockQuantity === 0}
                  className="w-full bg-white border border-neutral-800 text-neutral-900 rounded-2xl py-3.5 text-xs font-bold shadow-2xs hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  Add to Bag 🛍️
                </button>
                <button 
                  onClick={(e) => { handleAddToCart(); navigate('/checkout'); }}
                  disabled={product.stockQuantity === 0}
                  className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer uppercase tracking-wider"
                >
                  <Zap size={15} className="mr-1.5" /> 1 Click Order
                </button>
              </div>

              {/* Social Share */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-neutral-500 font-medium">Share Product:</span>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    f
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Product link copied to clipboard!');
                    }}
                    className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-black transition-colors font-bold text-xs cursor-pointer shadow-2xs"
                    title="Copy Link"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a 
                href={`https://wa.me/8801700000000?text=Hi%20Rare%20Dreams!%20I'm%20interested%20in%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 text-xs sm:text-sm font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center mt-3 cursor-pointer border border-emerald-500"
              >
                <MessageCircle size={18} className="mr-2 fill-white" />
                Knock on WhatsApp for any help
              </a>
            </div>
          </div>

          {/* Description & Contact Tabs */}
          <div className="bg-white rounded-3xl shadow-2xs border border-neutral-200/80 overflow-hidden mb-8">
            <div className="flex border-b border-neutral-200 bg-neutral-50/50">
              <button 
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'description' 
                    ? 'border-b-2 border-black text-black bg-white' 
                    : 'text-neutral-400 hover:text-black'
                }`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'contact' 
                    ? 'border-b-2 border-black text-black bg-white' 
                    : 'text-neutral-400 hover:text-black'
                }`}
              >
                Contact & Support
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'description' ? (
                <div className="prose prose-sm prose-neutral max-w-none space-y-4">
                  <p className="text-neutral-700 leading-relaxed text-sm">
                    {product.description}
                  </p>
                  {product.material && (
                    <div className="pt-2">
                      <p className="font-bold text-xs uppercase tracking-wider text-neutral-900 mb-1">Material & Care Instructions:</p>
                      <p className="text-neutral-600 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-200/60 inline-block">{product.material}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 text-xs sm:text-sm">
                  <p className="text-neutral-600 leading-relaxed font-medium">
                    Have any questions or need custom sizing help? Our support team is available 7 days a week.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <a 
                      href="tel:01700000000" 
                      className="flex items-center space-x-3 p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                        <HeadphonesIcon size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block">Phone Support</span>
                        <span className="font-bold text-neutral-900">+880 1700-000000</span>
                      </div>
                    </a>

                    <a 
                      href="https://wa.me/8801700000000" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <MessageCircle size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">WhatsApp Chat</span>
                        <span className="font-bold text-emerald-950">+880 1700-000000</span>
                      </div>
                    </a>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">Operating Hours</span>
                    <p className="text-xs font-bold text-neutral-900">10:00 AM - 10:00 PM (Daily)</p>
                    <p className="text-[11px] text-neutral-500">Fast delivery within 24-48 hours in Dhaka, and 2-3 days nationwide.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products: You May Also Like */}
      <section className="mt-16 pt-12 border-t border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 font-display">
              You May Also Like
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Handpicked items from our <span className="font-bold text-neutral-800">{product.category}</span> collection
            </p>
          </div>
        </div>

        {loadingRecommended ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductSkeleton key={i} index={i} />
            ))}
          </div>
        ) : recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {recommendedProducts.map((rec, index) => (
              <ProductCard key={rec.id} product={rec} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-50 rounded-2xl p-8 text-center border border-neutral-200/60">
            <p className="text-xs font-bold text-neutral-500">No other products in this category yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}
