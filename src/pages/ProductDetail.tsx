import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCartStore } from '../store/useCartStore';
import { useFlyToCart } from '../context/FlyToCartContext';
import { ChevronRight, Heart, Share2, Info, Star, MessageCircle, Zap, ShieldCheck, Truck, HeadphonesIcon, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';
import { LazyImage } from '../components/LazyImage';
import { ProductDetailSkeleton } from '../components/ProductDetailSkeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  const { animateAddToCart } = useFlyToCart();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct(data);
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
            <div className="bg-neutral-50 rounded-2xl p-4 text-sm text-neutral-600 leading-relaxed mb-6 border border-neutral-100">
              {product.description?.substring(0, 150)}...
              <span className="block mt-2 font-medium text-amber-600">✨ Style, shine & elegance — all in one piece!</span>
            </div>

            <div className="space-y-6 mb-6">
              {/* Colors */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Color: {selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={clsx(
                        "px-6 py-3 text-sm font-medium transition-all border",
                        selectedColor === color 
                          ? "border-black bg-black text-white" 
                          : "border-neutral-200 bg-white text-black hover:border-black"
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
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Size: {selectedSize}</span>
                  <button className="text-xs font-medium underline text-neutral-500 hover:text-black">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={clsx(
                        "w-12 h-12 flex items-center justify-center text-sm font-medium transition-all border",
                        selectedSize === size 
                          ? "border-black bg-black text-white" 
                          : "border-neutral-200 bg-white text-black hover:border-black"
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
                <div className="flex items-center border border-neutral-200 rounded-xl h-12 w-32 shrink-0 overflow-hidden bg-white shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 flex justify-center items-center hover:bg-neutral-50 transition-colors text-lg"
                  >-</button>
                  <span className="flex-1 text-center font-medium border-x border-neutral-100">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="flex-1 flex justify-center items-center hover:bg-neutral-50 transition-colors text-lg"
                  >+</button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button 
                  onClick={(e) => handleAddToCart(e)}
                  disabled={product.stockQuantity === 0}
                  className="w-full bg-white border border-neutral-800 text-neutral-900 rounded-2xl py-3.5 text-sm font-bold shadow-sm hover:bg-neutral-50 active:scale-95 transition-all disabled:opacity-50"
                >
                  Add to Bag 🛍️
                </button>
                <button 
                  onClick={(e) => { handleAddToCart(); navigate('/checkout'); }}
                  disabled={product.stockQuantity === 0}
                  className="w-full bg-emerald-600 text-white rounded-2xl py-3.5 text-sm font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  <Zap size={16} className="mr-1.5" /> 1 Click Order
                </button>
              </div>

              {/* Social Share & Contact */}
              <div className="flex items-center justify-between pt-4 pb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-neutral-500">Share:</span>
                  <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">f</button>
                  <button className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors">X</button>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a 
                href={`https://wa.me/1234567890?text=I'm interested in ${product.name}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-500 text-white rounded-xl py-3.5 text-sm font-bold shadow-sm hover:bg-green-600 transition-colors flex items-center justify-center mt-2"
              >
                <MessageCircle size={20} className="mr-2" />
                Knock on WhatsApp for any help
              </a>
            </div>
          </div>

          {/* Description Tabs */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden mb-8">
            <div className="flex border-b border-neutral-200">
              <button className="flex-1 py-4 text-sm font-bold border-b-2 border-black">Description</button>
              <button className="flex-1 py-4 text-sm font-medium text-neutral-500 hover:text-black">Contact</button>
            </div>
            <div className="p-6 prose prose-sm prose-neutral max-w-none">
              <p className="text-neutral-600 leading-relaxed">
                {product.description}
              </p>
              {product.material && (
                <>
                  <p className="font-medium mt-4">Material & Care:</p>
                  <p className="text-neutral-600">{product.material}</p>
                </>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800 text-white flex items-center justify-center shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">Standard Delivery</h4>
                <p className="text-sm text-neutral-500">Fast and reliable shipping across Bangladesh</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <HeadphonesIcon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">24/7 Customer Support</h4>
                <p className="text-sm text-neutral-500">Contact us anytime for any queries.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                <RotateCcw size={24} />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">Easy Return Policy</h4>
                <p className="text-sm text-neutral-500">Return system available if you face any issues with the product.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
