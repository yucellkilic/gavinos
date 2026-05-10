'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MenuItem } from '@/types/menu';

interface MenuCardProps {
  item: MenuItem;
}

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

export default function MenuCard({ item }: MenuCardProps) {
  const price = item.base_price ?? item.item_price ?? 0;
  const displayName = item.name || item.item_name || 'Unnamed Item';
  const category = item.category_name || '';
  const icon = CATEGORY_ICONS[category] || (category.toLowerCase().includes('pizza') ? '🍕' : '🍽️');

  return (
    <Link href={`/menu/${item.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-smooth cursor-pointer h-full border border-gray-100"
      >
        <div className="flex flex-row sm:flex-col h-full">
          {/* Image Placeholder */}
          <div className="relative w-28 h-auto sm:w-full sm:h-48 bg-gradient-to-br from-forestGreen/10 to-classicRed/10 flex-shrink-0 flex items-center justify-center overflow-hidden border-r sm:border-r-0 sm:border-b border-gray-100">
            <div className="text-5xl sm:text-7xl drop-shadow-md">{icon}</div>

            {/* Category Badge - Desktop only */}
            {category && (
              <div className="hidden sm:block absolute top-3 right-3">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-classicRed text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm border border-red-100">
                  {category}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
            <div>
              {/* Category Badge - Mobile only */}
              {category && (
                <div className="sm:hidden mb-1">
                  <span className="text-[10px] font-bold text-classicRed uppercase tracking-wider">
                    {category}
                  </span>
                </div>
              )}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 font-poppins leading-tight line-clamp-2">
                {displayName}
              </h3>

              {item.choice_name && (
                <p className="text-xs sm:text-sm text-gray-500 mb-2 truncate">
                  Option: {item.choice_name}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 sm:mt-3">
              <div>
                <span className="text-lg sm:text-2xl font-black text-forestGreen">
                  ${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}
                </span>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-forestGreen/10 text-forestGreen text-xs sm:text-sm font-bold rounded-lg hover:bg-forestGreen hover:text-white transition-colors"
              >
                View
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
