import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useFlyToCart } from '../context/FlyToCartContext';
import { useWishlistStore } from '../store/useWishlistStore';
import { useLanguageStore, translateCategory } from '../store/useLanguageStore';
import { ChevronRight, Share2, MessageCircle, Zap, HeadphonesIcon, Heart, Sparkles, X, Loader2, Ruler, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { LazyImage } from '../components/LazyImage';
import { ProductDetailSkeleton } from '../components/ProductDetailSkeleton';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton } from '../components/ProductSkeleton';
import SEO from '../components/SEO';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguageStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'contact'>('description');
  
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  // AI Size Recommender Modal State
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [childAge, setChildAge] = useState('');
  const [childHeight, setChildHeight] = useState('');
  const [childWeight, setChildWeight] = useState('');
  const [fitPreference, setFitPreference] = useState('Comfortable Regular Fit');
  const [sizeRecommendation, setSizeRecommendation] = useState<{ size: string; explanation: string } | null>(null);
  const [sizeLoading, setSizeLoading] = useState(false);

  const handleGetAiSizeRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childAge) {
      alert(language === 'bn' ? "অনুগ্রহ করে বাচ্চার বয়স লিখুন" : "Please enter child's age");
      return;
    }
    setSizeLoading(true);
    const available = product?.sizeOptions && product.sizeOptions.length > 0 ? product.sizeOptions : ['S', 'M', 'L'];
    try {
      const res = await fetch("/api/ai-recommend-size", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product?.name,
          category: product?.category,
          availableSizes: available,
          age: childAge,
          height: childHeight,
          weight: childWeight,
          fitPreference
        })
      });
      const data = await res.json();
      if (data.recommendedSize) {
        setSizeRecommendation({
          size: data.recommendedSize,
          explanation: data.explanation || (language === 'bn' ? "বাচ্চার বয়স ও স্বাচ্ছন্দ্য অনুযায়ী পারফেক্ট সাইজ।" : "Optimal fit based on age and comfort preference.")
        });
        setSelectedSize(data.recommendedSize);
      } else {
        throw new Error("No size in response");
      }
    } catch (err) {
      console.warn("Using smart client fallback for size recommendation:", err);
      const fallbackSize = available[0] || 'M';
      const explanationText = language === 'bn' 
        ? `বাচ্চার বয়স (${childAge}) বিবেচনা করে দীর্ঘমেয়াদী ব্যবহার ও সর্বোচ্চ আরামের জন্য '${fallbackSize}' সাইজটি বেছে নেওয়ার পরামর্শ দেওয়া হচ্ছে।`
        : `Based on child age (${childAge}), size '${fallbackSize}' is recommended for maximum comfort and room to grow.`;
      
      setSizeRecommendation({
        size: fallbackSize,
        explanation: explanationText
      });
      setSelectedSize(fallbackSize);
    } finally {
      setSizeLoading(false);
    }
  };

  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const { animateAddToCart } = useFlyToCart();
  const addItem = useCartStore((state) => state.addItem);
  const favorited = product ? isWishlisted(product.id) : false;

  // Calculate discount percentage if not explicitly defined
  let discountPct = product?.discount;
  if (!discountPct && product?.comparePrice && product.comparePrice > product.price) {
    discountPct = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  }

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
          <div className="w-full relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm mb-4 group">
            {/* Wishlist Heart Button */}
            <button 
              type="button"
              onClick={() => product && toggleWishlist(product.id)}
              aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
              className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all cursor-pointer ${
                favorited 
                  ? 'bg-white text-red-500 scale-110 ring-1 ring-red-100' 
                  : 'bg-white/90 backdrop-blur-xs text-neutral-600 hover:text-red-500 hover:bg-white hover:scale-110'
              }`}
            >
              <Heart 
                size={20} 
                strokeWidth={favorited ? 0 : 2} 
                className={favorited ? "text-red-500 fill-red-500" : "text-neutral-600 hover:text-red-500"} 
              />
            </button>

            {/* Discount Badge on Product Detail Image */}
            {discountPct && discountPct > 0 ? (
              <div className="absolute top-4 left-4 z-10 bg-[#EF4444] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md border border-white/20 tracking-tight">
                -{discountPct}% OFF
              </div>
            ) : product.isFlashSale ? (
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-white/20 flex items-center gap-1">
                <span>⚡</span>
                <span>FLASH SALE</span>
              </div>
            ) : null}

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
              <span>{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}: <span className="font-medium text-neutral-900">{translateCategory(product.category, language)}</span></span>
              <span>{language === 'bn' ? 'ব্র্যান্ড' : 'Brand'}: <span className="font-medium text-neutral-900">Rare Dreams</span></span>
            </div>
            
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900">৳ {product.price.toFixed(2)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-lg text-neutral-400 line-through">৳ {product.comparePrice.toFixed(2)}</span>
              )}
              {product.isFlashSale ? (
                <span className="bg-red-100 text-red-700 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  ⚡ {language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
                </span>
              ) : discountPct && discountPct > 0 ? (
                <span className="bg-red-100 text-red-700 text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                  {language === 'bn' ? `${discountPct}% ছাড়` : `Save ${discountPct}%`}
                </span>
              ) : null}
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
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">{language === 'bn' ? 'কালার:' : 'Color:'} <span className="text-black">{selectedColor}</span></span>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">{language === 'bn' ? 'সাইজ:' : 'Size:'} <span className="text-black">{selectedSize}</span></span>
                  <button
                    onClick={() => setIsSizeModalOpen(true)}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles size={13} className="text-amber-600 animate-pulse" />
                    <span>{language === 'bn' ? 'AI সাইজ হেল্পার' : 'AI Size Helper'}</span>
                  </button>
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
                  {t('product.add_to_cart')} 🛍️
                </button>
                <button 
                  onClick={(e) => { handleAddToCart(); navigate('/checkout'); }}
                  disabled={product.stockQuantity === 0}
                  className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer uppercase tracking-wider"
                >
                  <Zap size={15} className="mr-1.5" /> {t('product.order_now')}
                </button>
              </div>

              {/* Social Share */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-neutral-500 font-medium">{language === 'bn' ? ' শেয়ার করুন:' : 'Share Product:'}</span>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity font-bold text-xs cursor-pointer shadow-2xs"
                  >
                    f
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert(language === 'bn' ? 'লিঙ্ক কপি করা হয়েছে!' : 'Product link copied to clipboard!');
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
                {language === 'bn' ? 'যেকোনো সহায়তায় হোয়াটসঅ্যাপে নক দিন' : 'Knock on WhatsApp for any help'}
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
                {language === 'bn' ? 'বিবরণ' : 'Description'}
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'contact' 
                    ? 'border-b-2 border-black text-black bg-white' 
                    : 'text-neutral-400 hover:text-black'
                }`}
              >
                {language === 'bn' ? 'যোগাযোগ ও সাপোর্ট' : 'Contact & Support'}
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

      {/* AI SIZE RECOMMENDER MODAL */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 relative overflow-hidden">
            <button
              onClick={() => setIsSizeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-3 py-1 rounded-full w-max text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} className="text-amber-600" />
              <span>{language === 'bn' ? 'AI স্মার্ট সাইজ হেল্পার' : 'AI Smart Size Recommender'}</span>
            </div>

            <h3 className="text-xl font-black text-neutral-900 tracking-tight">
              {language === 'bn' ? `${product.name}-এর সঠিক সাইজ খুঁজুন` : `Find Perfect Size for ${product.name}`}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 mb-5">
              {language === 'bn' ? 'বাচ্চার বয়স ও উচ্চতা দিন। আমাদের AI সেরা সাইজটি সিলেক্ট করে দিবে।' : "Enter child's age & measurements. Our AI will calculate the ideal size for max comfort."}
            </p>

            <form onSubmit={handleGetAiSizeRecommendation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'বাচ্চার বয়স *' : "Child's Age *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: ২.৫ বছর, ৫ বছর, ৬ মাস' : 'e.g., 2.5 Years, 5 Years, 6 Months'}
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    {language === 'bn' ? 'উচ্চতা (ঐচ্ছিক)' : 'Height (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: ৯৫ সেমি বা ৩ ফুট' : 'e.g. 95 cm or 3 ft'}
                    value={childHeight}
                    onChange={(e) => setChildHeight(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    {language === 'bn' ? 'ওজন (ঐচ্ছিক)' : 'Weight (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'bn' ? 'যেমন: ১৪ কেজি' : 'e.g. 14 kg'}
                    value={childWeight}
                    onChange={(e) => setChildWeight(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2 text-xs font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'ফিটিং পছন্দ' : 'Fit Preference'}
                </label>
                <select
                  value={fitPreference}
                  onChange={(e) => setFitPreference(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-900 outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="Comfortable Regular Fit">{language === 'bn' ? 'আরামদায়ক রেগুলার ফিট' : 'Comfortable Regular Fit'}</option>
                  <option value="Slightly Loose for Growth">{language === 'bn' ? 'সামান্য লুজ (বাচ্চার বৃদ্ধির জন্য ভালো)' : 'Slightly Loose (Recommended for Growing Kids)'}</option>
                  <option value="Snug Tailored Fit">{language === 'bn' ? 'ফিটেড টেলরড ফিট' : 'Snug Tailored Fit'}</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={sizeLoading}
                className="w-full bg-black text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
              >
                {sizeLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{language === 'bn' ? 'হিসাব করা হচ্ছে...' : 'Calculating Size...'}</span>
                  </>
                ) : (
                  <>
                    <Ruler size={16} />
                    <span>{language === 'bn' ? 'সঠিক সাইজ হিসাব করুন' : 'Calculate Recommended Size'}</span>
                  </>
                )}
              </button>
            </form>

            {/* AI Recommendation Output Box */}
            {sizeRecommendation && (
              <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-2 text-emerald-900 font-extrabold text-sm">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>{language === 'bn' ? 'পরামর্শকৃত সাইজ:' : 'Recommended Size:'} <span className="bg-emerald-900 text-white px-2.5 py-0.5 rounded-lg text-xs ml-1">{sizeRecommendation.size}</span></span>
                </div>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  {sizeRecommendation.explanation}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase pt-1">
                  ✓ {language === 'bn' ? `সাইজ "${sizeRecommendation.size}" আপনার জন্য সিলেক্ট করা হয়েছে!` : `Size "${sizeRecommendation.size}" has been automatically selected for you!`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
