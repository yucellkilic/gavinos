'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/priceCalculator';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, totalPrice, removeItem, updateItemQuantity, clearCart } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 font-poppins">Your Cart</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-smooth"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="text-forestGreen hover:underline font-medium"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center">
                        <div className="text-2xl">🍕</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item?.name || 'Item'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item?.numberOfPeople || 1} people × {item?.quantity || 1} qty
                        </p>

                        {/* Show selected modifiers */}
                        {Array.isArray(item?.selected_modifiers) && item.selected_modifiers.length > 0 && (
                          <div className="mt-1.5 space-y-0.5">
                            {item.selected_modifiers.map((mod, i) => (
                              <p key={i} className="text-xs text-forestGreen/80 truncate">
                                + {mod?.modifier_name || 'Extra'}{Number(mod?.price) > 0 ? ` ($${Number(mod.price).toFixed(2)})` : ''}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Show legacy optional options */}
                        {Array.isArray(item?.configuration?.optionalOptions) && item.configuration.optionalOptions.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.configuration.optionalOptions.map((opt, i) => (
                              <p key={`opt-${i}`} className="text-xs text-gray-400 truncate">
                                {opt}
                              </p>
                            ))}
                          </div>
                        )}

                        <p className="text-sm font-bold text-forestGreen mt-1">
                          {formatCurrency(item?.totalPrice ?? 0)}
                        </p>
                      </div>

                      <button
                        onClick={() => item?.id && removeItem(item.id)}
                        className="p-2 h-fit rounded-md hover:bg-red-50 text-red-500 transition-smooth"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Quantity:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => item?.id && updateItemQuantity(item.id, Math.max(1, (item?.quantity || 1) - 1))}
                          className="p-1 rounded bg-white hover:bg-gray-100 transition-smooth"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-semibold w-8 text-center">
                          {item?.quantity || 1}
                        </span>
                        <button
                          onClick={() => item?.id && updateItemQuantity(item.id, (item?.quantity || 1) + 1)}
                          className="p-1 rounded bg-white hover:bg-gray-100 transition-smooth"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-forestGreen">
                    {formatCurrency(totalPrice ?? 0)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full py-4 bg-forestGreen text-white text-center font-bold rounded-lg hover:bg-forestGreen/90 transition-smooth shadow-lg"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full py-2 text-sm text-red-500 hover:text-red-600 font-medium transition-smooth"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
