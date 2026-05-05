'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/priceCalculator';
import CheckoutDetailsForm from '@/components/CheckoutDetailsForm';

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, removeItem, updateItemQuantity, clearCart } = useCartStore();
  const [isFormValid, setIsFormValid] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some delicious items to get started!</p>
          <Link
            href="/menu"
            className="inline-block px-8 py-4 bg-forestGreen text-white font-semibold rounded-lg hover:bg-forestGreen/90 transition-smooth"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-forestGreen hover:text-forestGreen/80 mb-6 transition-smooth"
        >
          <ArrowLeft size={20} className="mr-2 flex-shrink-0" />
          <span className="break-words">Continue Shopping</span>
        </button>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 font-poppins break-words">
          Shopping Cart
        </h1>

        <div className="space-y-4 mb-6 sm:mb-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-md w-full max-w-full overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-full">
                <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center mx-auto sm:mx-0">
                  <div className="text-3xl sm:text-4xl">🍕</div>
                </div>

                <div className="flex-1 min-w-0 w-full max-w-full">
                  <div className="flex flex-row justify-between items-start gap-2 mb-3 max-w-full">
                    <div className="flex-1 min-w-0 max-w-full overflow-hidden">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 break-words overflow-wrap-anywhere max-w-full">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                        {item.numberOfPeople} people × {item.quantity} qty
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-smooth flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full">
                    <div className="flex items-center gap-2 sm:gap-3 justify-start flex-shrink-0">
                      <button
                        onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-base sm:text-lg font-semibold min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                        aria-label="Increase quantity"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="flex-shrink-0 text-left sm:text-right min-w-0 max-w-full overflow-hidden">
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-forestGreen break-words overflow-wrap-anywhere max-w-full">
                        {formatCurrency(item.totalPrice ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Checkout Details Form */}
        <div className="mb-8">
          <CheckoutDetailsForm onValidationComplete={setIsFormValid} />
        </div>

        <div className="bg-forestGreen/5 rounded-xl p-4 sm:p-6 border-2 border-forestGreen mb-6 w-full max-w-full overflow-hidden">
          <div className="flex flex-row justify-between items-center gap-3 mb-4 w-full max-w-full flex-wrap">
            <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 flex-shrink-0">Total:</span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-forestGreen break-words overflow-wrap-anywhere text-right min-w-0 max-w-full">
              {formatCurrency(totalPrice ?? 0)}
            </span>
          </div>
          
          {!isFormValid && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm">
              Please complete the delivery details above to proceed to checkout.
            </div>
          )}
          
          <Link
            href="/checkout"
            className={`block w-full py-4 text-white text-center font-bold rounded-lg transition-smooth shadow-lg text-sm sm:text-base ${
              isFormValid 
                ? 'bg-forestGreen hover:bg-forestGreen/90' 
                : 'bg-gray-400 cursor-not-allowed pointer-events-none'
            }`}
            onClick={(e) => {
              if (!isFormValid) {
                e.preventDefault();
              }
            }}
          >
            Proceed to Checkout
          </Link>
        </div>

        <button
          onClick={clearCart}
          className="w-full py-3 text-red-500 hover:text-red-600 font-medium transition-smooth text-sm sm:text-base"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
