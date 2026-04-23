'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MenuItem } from '@/types/menu';

interface MenuCardProps {
  item: MenuItem;
}

export default function MenuCard({ item }: MenuCardProps) {
  return (
    <Link href={`/menu/${item.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-smooth cursor-pointer h-full"
      >
        {/* Image Container */}
        <div className="relative h-56 w-full bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center">
          <div className="text-6xl">🍕</div>
          
          {/* Badges */}
          {item.badges && item.badges.length > 0 && (
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {item.badges.map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 bg-classicRed text-white text-xs font-bold rounded-full shadow-md"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins line-clamp-2">
            {item.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-forestGreen">
                ${item.base_price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-1">/ piece</span>
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
