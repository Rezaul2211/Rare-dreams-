import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
import { LazyImage } from '../components/LazyImage';

export default function Cart() {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + (subtotal > 0 ? shipping : 0);

  if (items.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-300">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tighter mb-4">Your cart is empty</h2>
        <p className="text-neutral-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest collections.
        </p>
        <Link 
          to="/shop" 
          className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 w-full flex-grow">
      <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter mb-12">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-2/3">
          <div className="border-t border-neutral-200">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex py-8 border-b border-neutral-200">
                <Link to={`/product/${item.id}`} className="w-32 h-40 bg-neutral-100 shrink-0 block relative">
                  {item.images && item.images.length > 0 && (
                    <LazyImage src={item.images[0]} alt={item.name} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                  )}
                </Link>
                <div className="ml-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wide mb-1">
                        <Link to={`/product/${item.id}`} className="hover:underline">{item.name}</Link>
                      </h3>
                      <div className="text-sm text-neutral-500 space-y-1">
                        {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                        {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex items-center border border-neutral-300 w-28 h-10">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="flex-1 flex justify-center items-center hover:bg-neutral-50"
                      >-</button>
                      <span className="flex-1 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="flex-1 flex justify-center items-center hover:bg-neutral-50"
                      >+</button>
                    </div>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-neutral-50 p-8 border border-neutral-200 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-wider mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-neutral-200 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-sm font-bold uppercase tracking-wider">Total</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
            
            <p className="text-xs text-neutral-500 text-center mt-6 uppercase tracking-wider">
              Taxes calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
