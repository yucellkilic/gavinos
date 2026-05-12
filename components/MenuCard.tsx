'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Minus, Heart, MessageSquare } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useCartStore } from '@/stores/cartStore';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/stores/authStore';
import { v4Fallback } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, string> = {
  'Beverages': '🥤',
  'Breakfast': '🍳',
  'Catering Packages': '📦',
  'Create-Your-Own Pizza': '🍕',
  'Croissants': '🥐',
  'Desserts': '🍰',
  'Gluten Free Pizza': '🌾',
  'Gourmet Pizza': '🍕',
  'Gyro': '🥙',
  'Hoagies': '🥪',
  'Italian Panino Tray': '🧺',
  'Mediterranean Mains & Sides': '🥗',
  'Miscellaneous': '🍴',
  'Ottoman Kebabs': '🍢',
  'Panini Sandwiches': '🥪',
  'Pasta Dinner': '🍝',
  'Quesadillas': '🌮',
  'Salad': '🥗',
  'Sides': '🍟',
  'Starters': '🥗',
  'Sub Sandwiches': '🥪',
  'Vegan Pizza': '🌱',
  'Wings': '🍗',
  'Wraps': '🌯',
};

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => { setIsMounted(true); }, []);

  const price = item.base_price ?? item.item_price ?? 0;
  const displayName = item.name || item.item_name || 'Unnamed Item';
  const category = item.category_name || '';
  const icon = CATEGORY_ICONS[category] || (category.toLowerCase().includes('pizza') ? '🍕' : '🍽️');
  const hasPrice = typeof price === 'number' && price > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const cartItem = {
      id: v4Fallback(),
      menuItemId: item.id,
      name: displayName,
      base_price: price,
      numberOfPeople: 1,
      quantity,
      configuration: { requiredOptions: {}, optionalOptions: [], selectedAccompaniments: [] },
      selected_modifiers: [],
      totalPrice: price * quantity,
      image_url: icon,
      category_name: category,
      special_instructions: instructions,
    };

    addItem(cartItem);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      setQuantity(1);
      setInstructions('');
      setShowInstructions(false);
    }, 1200);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(item.id);
    }
  };

  return (
    <div className="ez-card ez-card-interactive group relative flex flex-col h-full">
      {/* Favorite Button */}
      {isMounted && user && (
        <button
          onClick={handleFavorite}
          className={`ez-heart absolute top-3 right-3 z-10 ${isFavorite(item.id) ? 'active' : ''}`}
          aria-label="Toggle favorite"
        >
          <Heart size={18} fill={isFavorite(item.id) ? '#ef4444' : 'none'} />
        </button>
      )}

      <Link href={`/menu/${item.id}`} className="flex flex-col h-full">
        {/* Image/Icon Area */}
        <div className="relative h-36 bg-gradient-to-br from-ezGreen-light to-green-50 flex items-center justify-center overflow-hidden rounded-t-ez-lg">
          <span className="text-5xl drop-shadow-sm">{icon}</span>
          {category && (
            <div className="absolute bottom-2 left-2">
              <span className="ez-badge ez-badge-green">
                <span>{category}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug">
            <span>{displayName}</span>
          </h3>

          {item.choice_name && (
            <p className="text-xs text-gray-500 mb-2 truncate">
              <span>{'Option: '}</span><span>{item.choice_name}</span>
            </p>
          )}

          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-ezGreen">
                {hasPrice ? (
                  <span>${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}</span>
                ) : (
                  <span className="text-sm text-gray-500 font-medium">Market Price</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Add Section */}
      {hasPrice && isMounted && (
        <div className="px-4 pb-4 space-y-2">
          {/* Instructions Toggle */}
          <button
            onClick={(e) => { e.preventDefault(); setShowInstructions(!showInstructions); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-ezGreen transition-colors"
          >
            <MessageSquare size={12} />
            <span>Special Instructions</span>
          </button>

          {showInstructions && (
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="E.g., no onions, extra sauce..."
              className="ez-textarea text-xs"
              rows={2}
              onClick={(e) => e.preventDefault()}
            />
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-2">
            <div className="ez-stepper">
              <button
                onClick={(e) => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="ez-stepper-value"><span>{quantity}</span></span>
              <button
                onClick={(e) => { e.preventDefault(); setQuantity(quantity + 1); }}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={addedFeedback}
              className={`flex-1 ez-btn ez-btn-sm transition-all ${
                addedFeedback
                  ? 'bg-green-500 text-white'
                  : 'ez-btn-primary'
              }`}
            >
              {addedFeedback ? (
                <span>✓ Added!</span>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Add ${(price * quantity).toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
