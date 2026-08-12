import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { Product } from '../types';
import { LazyImage } from './LazyImage';
import { useFlyToCart } from '../context/FlyToCartContext';
import { useWishlistStore } from '../store/useWishlistStore';
import { useLanguageStore, translateCategory } from '../store/useLanguageStore';

interface CompactProductCardProps {
  product: Product;
}

export const CompactProductCard: React.FC<CompactProductCardProps> = React.memo(({ product }) => {
  const { animateAddToCart } = useFlyToCart();
  const { isWishlisted, toggleWishlist } = useWishlistStore();
  const { language, t } = useLanguageStore();
  const [added, setAdded] = React.useState(false);

  const favorited = isWishlisted(product.id);

  let discountPct = product.discountPercentage || product.discount;
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
    <div className="w-[155px] sm:w-[185px] md:w-[220px] shrink-0 flex flex-col bg-white rounded-2xl shadow-2xs hover:shadow-lg transition-all duration-300 border border-neutral-200/80 overflow-hidden relative group">
      {/* Image Thumbnail Link */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          {product.images && product.images.length > 0 ? (
            <LazyImage
              src={product.images[0]}
              alt={product.name}
              className="group-hover:scale-105 transition-transform duration-500"
              containerClassName="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] font-medium">
              No Image
            </div>
          )}
        </Link>

        {/* Discount Badge */}
        {product.stockQuantity === 0 ? (
          <div className="absolute top-2 left-2 z-10 bg-neutral-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {t('product.out_of_stock')}
          </div>
        ) : discountPct && discountPct > 0 ? (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs tracking-tight">
            -{discountPct}%
          </div>
        ) : product.isFlashSale ? (
          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
            ⚡ Sale
          </div>
        ) : null}

        {/* Heart Wishlist Overlay Button */}
        <button 
          type="button"
          onClick={handleWishlistClick}
          aria-label={favorited ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full shadow-xs flex items-center justify-center transition-all cursor-pointer ${
            favorited 
              ? 'bg-white text-red-500 scale-105' 
              : 'bg-white/80 backdrop-blur-xs text-neutral-600 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart 
            size={14} 
            strokeWidth={favorited ? 0 : 2} 
            className={favorited ? "text-red-500 fill-red-500" : "text-neutral-600 hover:text-red-500"} 
          />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-grow">
        {product.category && (
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5 line-clamp-1">
            {translateCategory(product.category, language)}
          </span>
        )}

        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-xs font-bold text-neutral-900 line-clamp-1 mb-1 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars Badge */}
        <div className="flex items-center space-x-1 mb-2">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-neutral-800">5.0</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-center justify-between pt-1.5 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="font-black text-xs sm:text-sm text-neutral-900">
              ৳ {product.price.toFixed(0)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[10px] text-neutral-400 line-through">
                ৳ {product.comparePrice.toFixed(0)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCartClick}
            disabled={product.stockQuantity === 0}
            aria-label="Add to Cart"
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all shadow-2xs cursor-pointer ${
              added 
                ? 'bg-emerald-600 text-white' 
                : 'bg-neutral-900 text-white hover:bg-black active:scale-95 disabled:opacity-40'
            }`}
          >
            {added ? <Check size={14} /> : <ShoppingBag size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
});
