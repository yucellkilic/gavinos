'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import MenuCard from '@/components/MenuCard';
import SidebarCart from '@/components/SidebarCart';
import { MenuItem, Category } from '@/types/menu';
import { Search, X, Filter } from 'lucide-react';

interface MenuClientProps {
  initialItems: MenuItem[];
  totalItems: number;
  categories: Category[];
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
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Sync items state with server data
  useEffect(() => {
    const offset = parseInt(searchParams.get('offset') || '0');
    if (offset === 0) {
      setItems(initialItems);
    } else {
      const existingIds = new Set(items.map(i => i.id));
      const newItems = initialItems.filter(i => !existingIds.has(i.id));
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
      }
    }
    setIsLoadingMore(false);
  }, [initialItems, searchParams]);

  const updateFilters = (category: string, search: string) => {
    setIsLoadingMore(true);
    setItems([]);
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (search) params.set('search', search);
    router.push(`/menu?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    updateFilters(id, searchTerm);
    setShowMobileCategories(false);
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

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="ez-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Category Bar */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="ez-container">
          <nav className="flex items-center gap-1 py-3 whitespace-nowrap">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-[var(--ez-green)] text-white'
                  : 'text-[var(--ez-gray-600)] hover:bg-[var(--ez-gray-50)]'
              }`}
            >
              <span>All Items</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.name)}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                  activeCategory === cat.name
                    ? 'bg-[var(--ez-green)] text-white'
                    : 'text-[var(--ez-gray-600)] hover:bg-[var(--ez-gray-50)]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="ez-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Content */}
          <div className="flex-1 min-w-0">
            {/* Page Title & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-[var(--ez-gray-900)] tracking-tight mb-1">
                  <span>Catering Menu</span>
                </h1>
                <p className="text-[13px] text-[var(--ez-gray-600)] font-medium">
                  <span>{items.length} items available in {activeCategory === 'all' ? 'all categories' : activeCategory}</span>
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="ez-input pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ez-gray-200)]" size={18} />
              </form>
            </div>

          {/* Mobile Category Dropdown */}
          <AnimatePresence>
            {showMobileCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/50"
                onClick={() => setShowMobileCategories(false)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-gray-900 mb-3"><span>Categories</span></h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`ez-pill ${activeCategory === 'all' ? 'ez-pill-active' : ''}`}
                    >
                      <span>🍽️</span><span>All Items</span>
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.name)}
                        className={`ez-pill ${activeCategory === cat.name ? 'ez-pill-active' : ''}`}
                      >
                        <span>{cat.icon || '🍽️'}</span><span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center: Menu Grid */}
          <div className="flex-1 min-w-0">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span>{'Showing '}</span>
                <span className="font-semibold text-gray-900">{items.length}</span>
                <span>{' of '}</span>
                <span className="font-semibold text-gray-900">{totalItems}</span>
                <span>{' items'}</span>
              </p>
            </div>

            {/* Grid */}
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuCard item={item} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Load More */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="ez-btn ez-btn-secondary ez-btn-lg"
                >
                  {isLoadingMore ? (
                    <span className="flex items-center gap-2">
                      <div className="ez-spinner" />
                      <span>Loading...</span>
                    </span>
                  ) : (
                    <span>{`Load More (${totalItems - items.length} remaining)`}</span>
                  )}
                </button>
              </div>
            )}

            {/* No Results */}
            {items.length === 0 && !isLoadingMore && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-base text-gray-500 font-medium">
                  <span>No items found matching your criteria.</span>
                </p>
              </div>
            )}
          </div>

          {/* Right: Sidebar Cart (Desktop only) */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <SidebarCart />
          </aside>
        </div>
      </div>
    </div>
  );
}
