'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MenuCard from '@/components/MenuCard';
import { MenuItem } from '@/types/menu';
import menuData from '@/data/menu.json';

// Menü kategorileri
const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🍽️' },
  { id: 'hot-hors', label: 'Hot Hors d\'Oeuvres', icon: '🔥' },
  { id: 'cold-hors', label: 'Cold Hors d\'Oeuvres', icon: '❄️' },
  { id: 'stationary', label: 'Stationary Displays', icon: '🧀' },
  { id: 'sit-down', label: 'Sit-Down Entrées', icon: '🍽️' },
  { id: 'duet', label: 'Duet Entrées', icon: '👥' },
  { id: 'buffet', label: 'Buffet Packages', icon: '🍴' },
  { id: 'carving', label: 'Carving Stations', icon: '🥩' },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const menuItems = menuData as MenuItem[];

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') {
      return menuItems;
    }

    return menuItems.filter((item) => {
      const badges = item.badges || [];
      switch (activeCategory) {
        case 'hot-hors':
          return badges.includes('Hot Hors d\'Oeuvres');
        case 'cold-hors':
          return badges.includes('Cold Hors d\'Oeuvres');
        case 'stationary':
          return badges.includes('Stationary Display');
        case 'sit-down':
          return badges.some(b => b.includes('Sit-Down Entrée') && !b.includes('Duet'));
        case 'duet':
          return badges.includes('Duet Entrée');
        case 'buffet':
          return badges.includes('Buffet Package');
        case 'carving':
          return badges.includes('Carving Station');
        default:
          return true;
      }
    });
  }, [activeCategory, menuItems]);

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-6xl font-black text-forestGreen mb-4">
            Our Catering Menu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-semibold">
            Discover our selection of premium Italian-inspired dishes, 
            crafted with artisan quality for your special events.
          </p>
        </motion.div>

        {/* Category Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-button px-6 py-3 rounded-full text-sm lg:text-base flex items-center gap-2 ${
                  activeCategory === category.id ? 'active' : ''
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="hidden sm:inline">{category.label}</span>
                <span className="sm:hidden">{category.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center mb-8"
        >
          <p className="text-gray-600 font-semibold">
            Showing <span className="text-forestGreen font-black">{filteredItems.length}</span> items
          </p>
        </motion.div>

        {/* Menu Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <MenuCard item={item} />
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-gray-500 font-semibold">
              No items found for this category.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
