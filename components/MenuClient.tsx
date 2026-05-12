'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import MenuCard from '@/components/MenuCard';
import SidebarCart from '@/components/SidebarCart';
import { MenuItem, Category } from '@/types/menu';
import { Search } from 'lucide-react';

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

  useEffect(() => { setIsMounted(true); }, []);

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

  if (!isMounted) return null;

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
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-black text-[var(--ez-gray-900)] tracking-tight mb-2">
                  <span>Catering Menu</span>
                </h1>
                <p className="text-[14px] text-[var(--ez-gray-600)]">
                  <span>{items.length} items available in {activeCategory === 'all' ? 'all categories' : activeCategory}</span>
                </p>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search menu..."
                  className="w-full bg-white border border-gray-200 rounded-[var(--radius-ez)] pl-10 pr-4 py-2.5 text-[14px] focus:border-[var(--ez-green)] outline-none transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </form>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>

            {/* Empty State */}
            {items.length === 0 && !isLoadingMore && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search or filters.</p>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="ez-btn ez-btn-secondary px-8 py-3"
                >
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <span>Load More</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Cart */}
          <aside className="hidden lg:block w-[340px] flex-shrink-0">
            <div className="sticky top-40">
              <SidebarCart />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
