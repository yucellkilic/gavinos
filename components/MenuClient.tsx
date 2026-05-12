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
    <div className="min-h-screen bg-[#f7f7f7] pb-24 lg:pb-8">
      <div className="ez-container py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            <span>Our Menu</span>
          </h1>
          <p className="text-sm text-gray-500">
            <span>Browse and order from our full catering menu</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit} className="relative max-w-lg">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search menu items..."
              className="ez-input pl-10 pr-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); updateFilters(activeCategory, ''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        {/* Mobile Category Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileCategories(!showMobileCategories)}
            className="ez-btn ez-btn-secondary ez-btn-sm w-full"
          >
            <Filter size={16} />
            <span>{activeCategory === 'all' ? 'All Categories' : activeCategory}</span>
          </button>
        </div>

        {/* Main Layout: Sidebar + Content + Cart */}
        <div className="flex gap-6">
          {/* Left: Category Sidebar (Desktop) */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-20">
              <div className="ez-card p-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                  <span>Categories</span>
                </h3>
                <nav className="space-y-0.5">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                      activeCategory === 'all'
                        ? 'bg-ezGreen text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-ezGreen'
                    }`}
                  >
                    <span className="text-base">🍽️</span>
                    <span>All Items</span>
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                        activeCategory === cat.name
                          ? 'bg-ezGreen text-white'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-ezGreen'
                      }`}
                    >
                      <span className="text-base">{cat.icon || '🍽️'}</span>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

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
