'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import MenuCard from '@/components/MenuCard';
import { MenuItem } from '@/types/menu';
import { Search, X } from 'lucide-react';

// Category icon mapping for visual polish
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

interface MenuClientProps {
  initialItems: MenuItem[];
  totalItems: number;
  categories: string[];
  initialCategory: string;
  initialSearch: string;
}

export default function MenuClient({
  initialItems,
  totalItems,
  categories,
  initialCategory,
  initialSearch,
}: MenuClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync items state with server data
  useEffect(() => {
    const offset = parseInt(searchParams.get('offset') || '0');
    if (offset === 0) {
      // Fresh load (category/search changed)
      setItems(initialItems);
    } else {
      // Append only new items
      const existingIds = new Set(items.map(i => i.id));
      const newItems = initialItems.filter(i => !existingIds.has(i.id));
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
      }
    }
    setIsLoadingMore(false);
  }, [initialItems, searchParams]);

  // Update URL when filters change (resets offset to 0)
  const updateFilters = (category: string, search: string) => {
    setIsLoadingMore(true);
    setItems([]); // Clear for fresh load UI
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    // Always reset to 0 offset on new filter (default is 0)
    router.push(`/menu?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    updateFilters(id, searchTerm);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(activeCategory, searchTerm);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    const currentOffset = parseInt(searchParams.get('offset') || '0');
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', (currentOffset + 50).toString());
    router.push(`/menu?${params.toString()}`, { scroll: false });
  };

  const hasMore = items.length < totalItems;

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
            Our Menu
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-semibold">
            Discover our selection of premium Italian-inspired dishes.
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search menu items..."
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

        {/* Category Buttons — dynamically generated from Supabase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {/* All Items button */}
            <button
              onClick={() => handleCategoryChange('all')}
              className={`category-button px-5 py-2.5 rounded-full text-sm flex items-center gap-2 transition-all ${
                activeCategory === 'all'
                  ? 'bg-forestGreen text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">🍽️</span>
              <span>All Items</span>
            </button>

            {/* Dynamic category buttons from database */}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`category-button px-5 py-2.5 rounded-full text-sm flex items-center gap-2 transition-all ${
                  activeCategory === cat
                    ? 'bg-forestGreen text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat] || '🍴'}</span>
                <span>{cat}</span>
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
            Showing <span className="text-forestGreen font-black">{items.length}</span> of{' '}
            <span className="text-forestGreen font-black">{totalItems}</span> items
          </p>
        </motion.div>

        {/* Menu Grid */}
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item) => (
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
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-10 py-4 bg-forestGreen text-white font-bold rounded-2xl shadow-lg hover:bg-forestGreen/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                `Load More (${totalItems - items.length} remaining)`
              )}
            </button>
          </div>
        )}

        {/* No Results */}
        {items.length === 0 && !isLoadingMore && (
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
      </div>
    </div>
  );
}
