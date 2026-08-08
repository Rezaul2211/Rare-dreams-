import React, { createContext, useContext, useState } from 'react';
import { motion } from 'motion/react';
import { useCartStore } from '../store/useCartStore';
import { Product } from '../types';

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface FlyToCartContextType {
  animateAddToCart: (product: Product, event: React.MouseEvent<HTMLElement> | HTMLElement, options?: { size?: string; color?: string; quantity?: number }) => void;
  isCartBouncing: boolean;
}

const FlyToCartContext = createContext<FlyToCartContextType | undefined>(undefined);

export const FlyToCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const animateAddToCart = (
    product: Product,
    eventOrElement: React.MouseEvent<HTMLElement> | HTMLElement,
    options?: { size?: string; color?: string; quantity?: number }
  ) => {
    // 1. Add to cart store
    addItem({
      ...product,
      cartItemId: crypto.randomUUID(),
      selectedSize: options?.size || (product.sizeOptions?.[0] || ''),
      selectedColor: options?.color || (product.colorOptions?.[0] || ''),
      quantity: options?.quantity || 1,
    });

    // 2. Calculate source rect (start position)
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

    // 3. Find target cart icon - strictly target the top-right header bag icon
    let targetX = window.innerWidth - 40;
    let targetY = 32;

    const targetElement = document.getElementById('header-cart-icon') || document.getElementById('mobile-cart-icon');

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
      },
    ]);
  };

  const handleAnimationComplete = (id: string) => {
    setFlyingItems((prev) => prev.filter((item) => item.id !== id));
    
    // Trigger bounce effect on cart icon
    setIsCartBouncing(true);
    setTimeout(() => {
      setIsCartBouncing(false);
    }, 400);
  };

  return (
    <FlyToCartContext.Provider value={{ animateAddToCart, isCartBouncing }}>
      {children}

      {/* Floating Animated Product Image flying straight to top-right header bag without rotation */}
      <div className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden">
        {flyingItems.map((item) => (
          <motion.div
            key={item.id}
            initial={{
              x: item.startX - 40,
              y: item.startY - 40,
              scale: 1.2,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: item.targetX - 12,
              y: item.targetY - 12,
              scale: 0.1,
              opacity: 0.85,
              rotate: 0,
            }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1], // Smooth natural curve entering header bag
            }}
            onAnimationComplete={() => handleAnimationComplete(item.id)}
            className="absolute w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-white shrink-0"
          >
            <img src={item.image} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
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
