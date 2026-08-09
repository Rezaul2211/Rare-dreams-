import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';
import { LazyImage } from './LazyImage';
import { useFlyToCart } from '../context/FlyToCartContext';
import { useWishlistStore } from '../store/useWishlistStore';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { animateAddToCart } = useFlyToCart();
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const [added, setAdded] = React.useState(false);

  const favorited = isWishlisted(product.id);

  // Calculate discount percentage if not explicitly given
  let discountPct = product.discount;
  if (!discountPct && product.comparePrice && product.comparePrice > product.price) {
    discountPct = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  }

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stockQuantity === 0) return;

    animateAddToCart(product, e);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay: Math.min(index * 0.06, 0.45), 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="group flex flex-col bg-white rounded-2xl md:rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-500 ease-out overflow-hidden border border-neutral-200/80 relative"
    >
      {/* Heart Wishlist Overlay */}
      <button 
        type="button"
        onClick={handleWishlistClick}
        aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-sm backdrop-blur-md transition-all cursor-pointer ${
          favorited 
            ? 'bg-red-50 text-red-500 hover:bg-red-100 scale-110 ring-2 ring-red-200' 
            : 'bg-white/80 text-neutral-400 hover:text-red-500 hover:bg-white hover:scale-105'
        }`}
      >
        <Heart size={18} strokeWidth={favorited ? 0 : 2} fill={favorited ? "currentColor" : "none"} />
      </button>

      {/* Image Thumbnail Link */}
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {product.images && product.images.length > 0 ? (
          <LazyImage
            src={product.images[0]}
            alt={product.name}
            className="group-hover:scale-108 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            containerClassName="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs font-medium">
            No Image
          </div>
        )}

        {/* Badges */}
        {product.stockQuantity === 0 ? (
          <div className="absolute top-3 left-3 bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm">
            Sold Out
          </div>
        ) : discountPct && discountPct > 0 ? (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md border border-white/20">
            {discountPct}% OFF
          </div>
        ) : null}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">
            {product.category}
          </span>
        )}

        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 mb-3 leading-snug group-hover:text-black transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price & Fly-To-Cart Action Button */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="font-extrabold text-base md:text-lg leading-none text-neutral-900">
              ৳ {product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-neutral-400 line-through mt-1">
                ৳ {product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Bag button with Fly-to-Cart Trigger */}
          <button
            type="button"
            onClick={handleCartClick}
            disabled={product.stockQuantity === 0}
            aria-label="Add to Cart"
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm cursor-pointer ${
              added 
                ? 'bg-emerald-600 text-white scale-110' 
                : 'bg-neutral-900 text-white hover:bg-black hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100'
            }`}
          >
            {added ? <Check size={18} /> : <ShoppingBag size={18} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

