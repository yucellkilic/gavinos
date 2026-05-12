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
    <div className="ez-card ez-card-interactive group relative flex flex-col h-[180px] sm:h-[160px]">
      <Link href={`/menu/${item.id}`} className="flex flex-row h-full">
        {/* Content Section (Left) */}
        <div className="flex-1 p-4 flex flex-col min-w-0">
          <div className="mb-auto">
            {/* Badges/Tags */}
            <div className="flex flex-wrap gap-1 mb-1.5">
              {item.is_active && (
                <span className="ez-badge ez-badge-green">
                  <span>Most ordered</span>
                </span>
              )}
            </div>
            
            <h3 className="text-[15px] font-bold text-[var(--ez-gray-900)] mb-1 line-clamp-1">
              <span>{displayName}</span>
            </h3>
            
            <p className="text-[13px] text-[var(--ez-gray-600)] line-clamp-2 leading-snug">
              <span>Includes fresh ingredients prepared daily for your event. Perfect for your group gathering.</span>
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-[var(--ez-gray-900)]">
                {hasPrice ? (
                  <span>${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}</span>
                ) : (
                  <span className="text-[13px] text-[var(--ez-gray-600)] font-medium">Market Price</span>
                )}
              </span>
              <span className="text-[11px] text-[var(--ez-gray-600)]">
                <span>Serves 10</span>
              </span>
            </div>
          </div>
        </div>

        {/* Image/Action Section (Right) */}
        <div className="w-[120px] h-full relative overflow-hidden bg-[var(--ez-gray-50)] border-l border-[var(--ez-gray-100)] flex-shrink-0">
          <div className="absolute inset-0 flex items-center justify-center text-4xl grayscale opacity-10">
            <span>{icon}</span>
          </div>
          
          {/* Bottom Right Add Button */}
          <div className="absolute bottom-3 right-3">
            <div className="w-8 h-8 rounded-full bg-white border border-[var(--ez-gray-200)] shadow-sm flex items-center justify-center text-[var(--ez-green)] group-hover:bg-[var(--ez-green)] group-hover:text-white group-hover:border-[var(--ez-green)] transition-all">
              <Plus size={20} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
