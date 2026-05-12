'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, MessageSquare, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';

export default function SidebarCart() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, totalPrice, removeItem, updateItemQuantity, updateItemInstructions, clearCart } = useCartStore();

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <div className="ez-sidebar-cart overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-[var(--ez-green)]" />
          <h2 className="text-sm font-bold text-[var(--ez-gray-900)] uppercase tracking-tight">
            <span>Your Order</span>
          </h2>
          {items.length > 0 && (
            <span className="ez-badge ez-badge-green ml-auto">
              <span>{items.reduce((s, i) => s + (i.quantity || 1), 0)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--ez-gray-50)]">
            <div className="text-4xl mb-4 grayscale opacity-50">🛒</div>
            <p className="text-sm font-semibold text-[var(--ez-gray-900)] mb-1">
              <span>Your cart is empty</span>
            </p>
            <p className="text-xs text-[var(--ez-gray-600)]">
              <span>Add items from the menu to get started</span>
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-1">
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartLineItem
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateItemQuantity}
                    onUpdateInstructions={updateItemInstructions}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      {items.length > 0 && (
        <div className="ez-cart-footer shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-[var(--ez-gray-600)] uppercase tracking-wide">Subtotal</span>
            <span className="text-lg font-bold text-[var(--ez-gray-900)]">
              <span>{formatCurrency(totalPrice ?? 0)}</span>
            </span>
          </div>

          <Link
            href="/cart"
            className="ez-btn ez-btn-primary w-full py-3 text-sm"
          >
            <span>Checkout</span>
          </Link>

          <button
            onClick={clearCart}
            className="w-full text-center text-[11px] text-[var(--ez-gray-600)] hover:text-red-500 transition-colors mt-3 py-1 font-medium"
          >
            <span>Clear Entire Cart</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CartLineItem({
  item,
  onRemove,
  onUpdateQuantity,
  onUpdateInstructions,
}: {
  item: any;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateInstructions: (id: string, text: string) => void;
}) {
  const [showNote, setShowNote] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="p-3"
    >
      <div className="flex gap-2.5">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-ezGreen-light flex items-center justify-center flex-shrink-0 text-lg">
          <span>{item.image_url || '🍕'}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
              <span>{item?.name || 'Item'}</span>
            </h4>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              aria-label="Remove item"
            >
              <X size={14} />
            </button>
          </div>

          {/* Modifiers */}
          {Array.isArray(item?.selected_modifiers) && item.selected_modifiers.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {item.selected_modifiers.map((mod: any, i: number) => (
                <p key={`mod-${i}`} className="text-[11px] text-gray-500">
                  <span>{'+ '}</span><span>{mod?.modifier_name || 'Extra'}</span>
                  {Number(mod?.price) > 0 && <span>{` ($${Number(mod.price).toFixed(2)})`}</span>}
                </p>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          {item.special_instructions && (
            <p className="text-[11px] text-ezOrange mt-1 italic">
              <span>{'📝 '}</span><span>{item.special_instructions}</span>
            </p>
          )}

          {/* Quantity + Price Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="ez-stepper" style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
              <button
                onClick={() => onUpdateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                disabled={(item.quantity || 1) <= 1}
                aria-label="Decrease"
              >
                <Minus size={12} />
              </button>
              <span className="ez-stepper-value"><span>{item.quantity || 1}</span></span>
              <button
                onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                aria-label="Increase"
              >
                <Plus size={12} />
              </button>
            </div>

            <span className="text-sm font-semibold text-ezGreen">
              <span>{formatCurrency(item?.totalPrice ?? 0)}</span>
            </span>
          </div>

          {/* Note toggle */}
          <button
            onClick={() => setShowNote(!showNote)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-ezGreen mt-1.5 transition-colors"
          >
            <MessageSquare size={10} />
            <span>{item.special_instructions ? 'Edit note' : 'Add note'}</span>
          </button>

          {showNote && (
            <textarea
              value={item.special_instructions || ''}
              onChange={(e) => onUpdateInstructions(item.id, e.target.value)}
              placeholder="Special instructions..."
              className="mt-1.5 w-full text-xs p-2 border border-gray-200 rounded-md resize-none focus:border-ezGreen focus:outline-none"
              rows={2}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
