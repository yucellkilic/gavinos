'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import MenuCard from '@/components/MenuCard';
import { MenuItem } from '@/types/menu';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '🍽️' },
  { id: 'Sub Sandwiches', label: 'Sub Sandwiches', icon: '🥪' },
  { id: 'Panini Sandwiches', label: 'Panini Sandwiches', icon: '🥪' },
  { id: 'Breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'Beverages', label: 'Beverages', icon: '🥤' },
  { id: 'Croissants', label: 'Croissants', icon: '🥐' },
  { id: 'Wraps', label: 'Wraps', icon: '🌯' },
  { id: 'Desserts', label: 'Desserts', icon: '🍰' },
  { id: 'Mediterranean Mains & Sides', label: 'Mediterranean', icon: '🥗' },
  { id: 'Pasta Dinner', label: 'Pasta', icon: '🍝' },
  { id: 'Hoagies', label: 'Hoagies', icon: '🥪' },
  { id: 'Starters', label: 'Starters', icon: '🥗' },
  { id: 'Sides', label: 'Sides', icon: '🍟' },
  { id: 'Gyro', label: 'Gyro', icon: '🥙' },
  { id: 'Salad', label: 'Salad', icon: '🥗' },
  { id: 'Wings', label: 'Wings', icon: '🍗' },
  { id: 'Create-Your-Own Pizza', label: 'CYO Pizza', icon: '🍕' },
  { id: 'Gourmet Pizza', label: 'Gourmet Pizza', icon: '🍕' },
  { id: 'Vegan Pizza', label: 'Vegan Pizza', icon: '🌱' },
  { id: 'Gluten Free Pizza', label: 'GF Pizza', icon: '🌾' },
  { id: 'Catering Packages', label: 'Catering Packages', icon: '📦' },
  { id: 'Quesadillas', label: 'Quesadillas', icon: '🌮' },
  { id: 'Italian Panino Tray', label: 'Panino Tray', icon: '🧺' },
  { id: 'Ottoman Kebabs', label: 'Ottoman Kebabs', icon: '🍢' },
];

interface MenuClientProps {
  initialItems: MenuItem[];
  policyItem: MenuItem | null;
  initialCategory: string;
  initialSearch: string;
}

export default function MenuClient({ 
  initialItems, 
  policyItem, 
  initialCategory,
  initialSearch 
}: MenuClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  // Sync state with initialItems (handles appending)
  useEffect(() => {
    const limit = parseInt(searchParams.get('limit') || '50');
    if (limit === 50) {
      setItems(initialItems);
    } else {
      // Append only the new items that aren't already in the state
      const currentIds = new Set(items.map(i => i.id));
      const newItems = initialItems.filter(i => !currentIds.has(i.id));
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
      }
    }
  }, [initialItems, searchParams]);

  // Update URL when filters change
  const updateFilters = (category: string, search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== 'all') params.set('category', category);
    else params.delete('category');
    
    if (search) params.set('search', search);
    else params.delete('search');

    params.set('limit', '50');

    router.push(`/menu?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    updateFilters(id, searchTerm);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(activeCategory, searchTerm);
  };

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
            Discover our selection of {items.length > 0 ? 'premium' : ''} Italian-inspired dishes, 
            now powered by Supabase.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto mb-10"
        >
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-forestGreen focus:ring-4 focus:ring-forestGreen/10 transition-all outline-none text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-forestGreen transition-colors" size={24} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); updateFilters(activeCategory, ''); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </form>
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
                onClick={() => handleCategoryChange(category.id)}
                className={`category-button px-6 py-3 rounded-full text-sm lg:text-base flex items-center gap-2 transition-all ${
                  activeCategory === category.id 
                    ? 'bg-forestGreen text-white shadow-lg scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-gray-600 font-semibold">
            Showing <span className="text-forestGreen font-black">{items.length}</span> items
          </p>
        </motion.div>

        {/* Menu Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <MenuCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Load More Button */}
        {items.length > 0 && items.length % 50 === 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                const currentLimit = parseInt(searchParams.get('limit') || '50');
                const params = new URLSearchParams(searchParams.toString());
                params.set('limit', (currentLimit + 50).toString());
                router.push(`/menu?${params.toString()}`, { scroll: false });
              }}
              className="px-10 py-4 bg-forestGreen text-white font-bold rounded-2xl shadow-lg hover:bg-forestGreen/90 transition-all hover:scale-105 active:scale-95"
            >
              Load More Products
            </button>
          </div>
        )}

        {/* No Results */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-500 font-semibold">
              No items found matching your criteria.
            </p>
          </motion.div>
        )}

        {/* Policies Section */}
        {policyItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 bg-gray-50 rounded-3xl p-8 lg:p-12 border border-gray-200"
          >
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">{policyItem.image_url || '📝'}</span>
              <h2 className="text-3xl font-bold text-forestGreen mb-2">{policyItem.name || 'Policies'}</h2>
              <p className="text-gray-600">{policyItem.description || ''}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {policyItem.policies && Object.entries(policyItem.policies).map(([key, value]) => (
                <div key={key} className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-gray-900 capitalize mb-2">
                    {key.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
