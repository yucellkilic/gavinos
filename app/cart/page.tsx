'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowLeft, MessageSquare, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';
import CheckoutDetailsForm from '@/components/CheckoutDetailsForm';

export default function CartPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { items, totalPrice, removeItem, updateItemQuantity, updateItemInstructions, clearCart } = useCartStore();
  const [isFormValid, setIsFormValid] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="ez-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            <span>Your cart is empty</span>
          </h1>
          <p className="text-gray-500 mb-6">
            <span>Add some delicious items to get started!</span>
          </p>
          <Link href="/menu" className="ez-btn ez-btn-primary ez-btn-lg">
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24 lg:pb-8">
      <div className="ez-container py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-ezGreen mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          <span>Shopping Cart</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          <span>{itemCount}</span><span>{' items in your cart'}</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <motion.div
                key={item?.id || Math.random().toString()}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ez-card p-4"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-lg bg-ezGreen-light flex items-center justify-center flex-shrink-0 text-2xl">
                    <span>{item?.image_url || '🍕'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          <span>{item?.name || 'Item'}</span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          <span>{item?.numberOfPeople || 1}</span><span>{' people'}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => item?.id && removeItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Modifiers */}
                    {Array.isArray(item?.selected_modifiers) && item.selected_modifiers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.selected_modifiers.map((mod, i) => (
                          <span key={`mod-${i}`} className="ez-badge ez-badge-green text-[10px]">
                            <span>{mod?.modifier_name || 'Extra'}</span>
                            {Number(mod?.price) > 0 && <span>{` +$${Number(mod.price).toFixed(2)}`}</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Special Instructions */}
                    {item.special_instructions && editingNote !== item.id && (
                      <p className="text-xs text-ezOrange mt-2 italic">
                        <span>{'📝 '}</span><span>{item.special_instructions}</span>
                      </p>
                    )}

                    {/* Note Editor */}
                    {editingNote === item.id ? (
                      <div className="mt-2">
                        <textarea
                          value={item.special_instructions || ''}
                          onChange={(e) => updateItemInstructions(item.id, e.target.value)}
                          placeholder="Special instructions..."
                          className="ez-textarea text-xs"
                          rows={2}
                        />
                        <button
                          onClick={() => setEditingNote(null)}
                          className="text-xs text-ezGreen font-medium mt-1"
                        >
                          <span>Done</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingNote(item.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-ezGreen mt-2 transition-colors"
                      >
                        <MessageSquare size={12} />
                        <span>{item.special_instructions ? 'Edit note' : 'Add special instructions'}</span>
                      </button>
                    )}

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="ez-stepper">
                        <button
                          onClick={() => item?.id && updateItemQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                          disabled={(item.quantity || 1) <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="ez-stepper-value"><span>{item?.quantity || 1}</span></span>
                        <button
                          onClick={() => item?.id && updateItemQuantity(item.id, (item.quantity || 1) + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-base font-bold text-ezGreen">
                        <span>{formatCurrency(item?.totalPrice ?? 0)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="ez-card p-5 sticky top-20">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                <span>Order Summary</span>
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500"><span>Subtotal</span></span>
                  <span className="font-medium"><span>{formatCurrency(totalPrice ?? 0)}</span></span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500"><span>Delivery</span></span>
                  <span className="text-ezGreen font-medium"><span>TBD</span></span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-4">
                <div className="flex justify-between">
                  <span className="font-semibold"><span>Total</span></span>
                  <span className="text-xl font-bold text-ezGreen">
                    <span>{formatCurrency(totalPrice ?? 0)}</span>
                  </span>
                </div>
              </div>

              {/* Checkout Details Form */}
              <div className="mb-4">
                <CheckoutDetailsForm onValidationComplete={setIsFormValid} />
              </div>

              <Link
                href="/checkout"
                className={`ez-btn w-full ez-btn-lg ${
                  isFormValid
                    ? 'ez-btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={(e) => { if (!isFormValid) e.preventDefault(); }}
              >
                <span>Proceed to Checkout</span>
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-gray-400 hover:text-red-500 mt-3 py-2 transition-colors"
              >
                <span>Clear Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
