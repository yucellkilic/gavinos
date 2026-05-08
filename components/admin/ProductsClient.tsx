'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Plus, 
  ChevronRight,
  X,
  Save,
  Filter
} from 'lucide-react';

interface Product {
  id: string;
  item_name: string;
  item_price: number | null;
  category_name: string;
  choice_name: string | null;
  choice_price: number | null;
}

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    item_name: '',
    item_price: '',
    category_name: '',
    choice_name: '',
    choice_price: ''
  });

  const fetchCategories = async () => {
    const { data } = await supabase.from('menu_items').select('category_name').not('category_name', 'is', null);
    if (data) {
      setCategories(Array.from(new Set(data.map(i => i.category_name as string))).sort());
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('menu_items').select('*', { count: 'exact' });
    
    if (selectedCategory !== 'all') {
      query = query.eq('category_name', selectedCategory);
    }
    if (searchQuery) {
      query = query.ilike('item_name', `%${searchQuery}%`);
    }

    const { data, count, error } = await query
      .order('item_name')
      .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

    if (!error && data) {
      setProducts(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, page]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      item_name: product.item_name || '',
      item_price: product.item_price ? product.item_price.toString() : '',
      category_name: product.category_name || '',
      choice_name: product.choice_name || '',
      choice_price: product.choice_price ? product.choice_price.toString() : ''
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      item_name: '',
      item_price: '',
      category_name: selectedCategory !== 'all' ? selectedCategory : '',
      choice_name: '',
      choice_price: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchProducts();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      item_name: formData.item_name,
      item_price: formData.item_price ? Number(formData.item_price) : null,
      category_name: formData.category_name,
      choice_name: formData.choice_name || null,
      choice_price: formData.choice_price ? Number(formData.choice_price) : null,
    };

    if (editingProduct) {
      await supabase.from('menu_items').update(payload).eq('id', editingProduct.id);
    } else {
      await supabase.from('menu_items').insert(payload);
    }

    setIsModalOpen(false);
    fetchProducts();
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      
      {/* Categories Sidebar */}
      <div className="w-full md:w-64 bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-4 flex flex-col h-64 md:h-full shrink-0">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
          <Filter size={16} /> Filter
        </h2>
        <div className="overflow-y-auto pr-2 space-y-1 custom-scrollbar flex-1">
          <button
            onClick={() => { setSelectedCategory('all'); setPage(1); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${
              selectedCategory === 'all' 
                ? 'bg-forestGreen/20 text-forestGreen font-bold border border-forestGreen/30' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setPage(1); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                selectedCategory === cat 
                  ? 'bg-forestGreen/20 text-forestGreen font-bold border border-forestGreen/30' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="truncate pr-2">{cat}</span>
              {selectedCategory === cat && <ChevronRight size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 flex flex-col h-[600px] md:h-full overflow-hidden">
        
        {/* Header Area */}
        <div className="p-6 border-b border-gray-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-800/80">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-2.5 pl-12 pr-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all text-sm"
            />
          </div>
          <button 
            onClick={handleAddNew}
            className="w-full sm:w-auto bg-forestGreen hover:bg-forestGreen/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-forestGreen/20"
          >
            <Plus size={18} /> Add New
          </button>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto custom-scrollbar p-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forestGreen"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700/50 text-sm">
                  <th className="p-4 font-semibold w-1/3">Item Name</th>
                  <th className="p-4 font-semibold">Base Price</th>
                  <th className="p-4 font-semibold">Option / Garnish</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product.id} 
                    className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white">{product.item_name}</div>
                      <div className="text-xs text-gray-500">{product.category_name}</div>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">
                      {product.item_price !== null ? `$${product.item_price.toFixed(2)}` : '-'}
                    </td>
                    <td className="p-4">
                      {product.choice_name ? (
                        <div className="inline-flex items-center gap-2 bg-gray-700/50 px-3 py-1 rounded-full text-xs text-gray-300">
                          {product.choice_name}
                          {product.choice_price !== null && <span className="text-forestGreen font-bold">+${product.choice_price.toFixed(2)}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-600 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(product)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-700/50 flex items-center justify-between bg-gray-800/80">
          <span className="text-sm text-gray-400">
            Showing <strong className="text-white">{(page - 1) * ITEMS_PER_PAGE + 1}</strong> to <strong className="text-white">{Math.min(page * ITEMS_PER_PAGE, totalCount)}</strong> of <strong className="text-white">{totalCount}</strong> results
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors text-sm font-semibold"
            >
              Previous
            </button>
            <button 
              disabled={page * ITEMS_PER_PAGE >= totalCount}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors text-sm font-semibold"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* CRUD Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-white mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Item Name</label>
                    <input 
                      required
                      value={formData.item_name}
                      onChange={e => setFormData({...formData, item_name: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forestGreen"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Category</label>
                    <input 
                      required
                      value={formData.category_name}
                      onChange={e => setFormData({...formData, category_name: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forestGreen"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Base Price ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.item_price}
                      onChange={e => setFormData({...formData, item_price: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forestGreen"
                    />
                  </div>
                  
                  <div className="col-span-2 mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-forestGreen font-semibold mb-3">Optional Choice / Garnish Info</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Choice Name</label>
                    <input 
                      value={formData.choice_name}
                      onChange={e => setFormData({...formData, choice_name: e.target.value})}
                      placeholder="e.g. Mozzarella"
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forestGreen"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Choice Price ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={formData.choice_price}
                      onChange={e => setFormData({...formData, choice_price: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-forestGreen"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-300 hover:bg-gray-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="bg-forestGreen hover:bg-forestGreen/90 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-forestGreen/20 transition-all">
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
