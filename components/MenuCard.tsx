'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MenuItem } from '@/types/menu';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  const price = item.base_price ?? item.item_price ?? 0;
  const displayName = item.name || item.item_name || 'Unnamed Item';
  const category = item.category_name || '';

  return (
    <Link href={`/menu/${item.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-smooth cursor-pointer h-full"
      >
        {/* Image Placeholder */}
        <div className="relative h-48 w-full bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center overflow-hidden">
          <div className="text-6xl">🍽️</div>

          {/* Category Badge */}
          {category && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-classicRed text-white text-xs font-bold rounded-full shadow-md">
                {category}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-1 font-poppins line-clamp-2">
            {displayName}
          </h3>

          {item.choice_name && (
            <p className="text-gray-500 text-sm mb-2">
              Option: {item.choice_name}
            </p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-2xl font-bold text-forestGreen">
                ${typeof price === 'number' ? price.toFixed(2) : Number(price).toFixed(2)}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-forestGreen text-white text-sm font-semibold rounded-lg hover:bg-forestGreen/90 transition-smooth"
            >
              View Details
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
