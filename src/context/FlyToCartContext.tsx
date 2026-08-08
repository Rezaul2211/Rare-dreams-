import React, { createContext, useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../store/useCartStore';
import { Product } from '../types';
import { ShoppingBag, Check } from 'lucide-react';

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  name: string;
}

interface FlyToCartContextType {
  animateAddToCart: (product: Product, event: React.MouseEvent<HTMLElement> | HTMLElement, options?: { size?: string; color?: string; quantity?: number }) => void;
  isCartBouncing: boolean;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined);

export const FlyToCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const animateAddToCart = (
    product: Product,
    eventOrElement: React.MouseEvent<HTMLElement> | HTMLElement,
    options?: { size?: string; color?: string; quantity?: number }
  ) => {
    // 1. First add to cart store
    addItem({
      ...product,
      cartItemId: crypto.randomUUID(),
      selectedSize: options?.size || (product.sizeOptions?.[0] || ''),
      selectedColor: options?.color || (product.colorOptions?.[0] || ''),
      quantity: options?.quantity || 1,
    });

    // 2. Calculate source rect
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;

    if ('currentTarget' in eventOrElement && eventOrElement.currentTarget) {
      const rect = eventOrElement.currentTarget.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    } else if (eventOrElement instanceof HTMLElement) {
      const rect = eventOrElement.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    }

    // 3. Find target cart icon (header or mobile bottom nav)
    let targetX = window.innerWidth - 60;
    let targetY = 32;

    const isMobile = window.innerWidth < 768;
    const targetElement = isMobile 
      ? document.getElementById('mobile-cart-icon') || document.getElementById('header-cart-icon')
      : document.getElementById('header-cart-icon') || document.getElementById('mobile-cart-icon');

    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      targetX = targetRect.left + targetRect.width / 2;
      targetY = targetRect.top + targetRect.height / 2;
    }

    const flyId = 'fly_' + Date.now() + '_' + Math.random();
    const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200';

    setFlyingItems((prev) => [
      ...prev,
      {
        id: flyId,
        image: productImage,
        startX,
        startY,
        targetX,
        targetY,
        name: product.name,
      },
    ]);

    setLastAddedName(product.name);

    // Auto remove notification after 3s
    setTimeout(() => {
      setLastAddedName(null);
    }, 3000);
  };

  const handleAnimationComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    
    // Trigger bounce on cart icon
    setIsCartBouncing(true);
    setTimeout(() => {
      setIsCartBouncing(false);
    }, 500);
  };

  return (
    <FlyToCartContext.Provider value={{ animateAddToCart, isCartBouncing }}>
      {children}

      {/* Floating Animated Thumbnails */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              x: item.startX - 32,
              y: item.startY - 32,
              scale: 1,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: item.targetX - 20,
              y: item.targetY - 20,
              scale: 0.25,
              opacity: 0.85,
              rotate: 360,
            }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1], // Custom smooth cubic-bezier curve
            }}
            onAnimationComplete={() => handleAnimationComplete(item.id)}
            className="absolute w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-white"
          >
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      {/* Premium Toast Feedback */}
      <AnimatePresence>
        {lastAddedName && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 md:right-8 z-[9999] bg-neutral-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-neutral-700 flex items-center space-x-3 backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold">
              <Check size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Added to Bag!</p>
              <p className="text-xs text-neutral-300 truncate max-w-[200px]">{lastAddedName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </FlyToCartContext.Provider>
  );
};

export const useFlyToCart = () => {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error('useFlyToCart must be used within a FlyToCartProvider');
  }
  return context;
};
