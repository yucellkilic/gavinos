'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/priceCalculator';

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, removeItem, updateItemQuantity, clearCart } = useCartStore();

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
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-forestGreen hover:text-forestGreen/80 mb-6 transition-smooth"
        >
          <ArrowLeft size={20} className="mr-2" />
          Continue Shopping
        </button>

        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 font-poppins">
          Shopping Cart
        </h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-md"
            >
              <div className="flex gap-6">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center">
                  <div className="text-4xl">🍕</div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.numberOfPeople} people × {item.quantity} quantity
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-smooth"
                      aria-label="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-lg font-semibold w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth"
                      >
                        <Plus size={18} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-forestGreen">
                        {formatCurrency(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-forestGreen/5 rounded-xl p-6 border-2 border-forestGreen mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold text-gray-900">Total:</span>
            <span className="text-3xl font-bold text-forestGreen">
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <Link
            href="/checkout"
            className="block w-full py-4 bg-forestGreen text-white text-center font-bold rounded-lg hover:bg-forestGreen/90 transition-smooth shadow-lg"
          >
            Proceed to Checkout
          </Link>
        </div>

        <button
          onClick={clearCart}
          className="w-full py-3 text-red-500 hover:text-red-600 font-medium transition-smooth"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}
