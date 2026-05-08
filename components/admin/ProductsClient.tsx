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
  option_count?: number;
}

interface Garnish {
  id: string;
  name: string;
  price: number;
  category_name: string | null;
  item_name: string | null;
  group_name: string;
}

export default function ProductsClient() {
  const [activeTab, setActiveTab] = useState<'products' | 'garnishes'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [garnishes, setGarnishes] = useState<Garnish[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGarnishModalOpen, setIsGarnishModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingGarnish, setEditingGarnish] = useState<Garnish | null>(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    item_name: '',
    item_price: '',
    category_name: '',
    choice_name: '',
    choice_price: ''
  });

  const [garnishFormData, setGarnishFormData] = useState({
    name: '',
    price: '',
    category_name: '',
    item_name: '',
    group_name: 'Options'
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
      // Fetch option counts for these products
      const { data: optCounts } = await supabase
        .from('menu_options')
        .select('item_name, category_name');

      const processedProducts = data.map(p => {
        const count = (optCounts || []).filter(o => 
          o.item_name === p.item_name || (o.category_name === p.category_name && !o.item_name)
        ).length;
        return { ...p, option_count: count };
      });

      setProducts(processedProducts);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  const fetchGarnishes = async () => {
    setLoading(true);
    const { data } = await supabase.from('menu_options').select('*').order('created_at', { ascending: false });
    if (data) setGarnishes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    else fetchGarnishes();
  }, [selectedCategory, searchQuery, page, activeTab]);

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

  const handleGarnishEdit = (garnish: Garnish) => {
    setEditingGarnish(garnish);
    setGarnishFormData({
      name: garnish.name,
      price: garnish.price.toString(),
      category_name: garnish.category_name || '',
      item_name: garnish.item_name || '',
      group_name: garnish.group_name
    });
    setIsGarnishModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await supabase.from('menu_items').delete().eq('id', id);
      fetchProducts();
    }
  };

  const handleGarnishDelete = async (id: string) => {
    if (window.confirm('Are you sure?')) {
      await supabase.from('menu_options').delete().eq('id', id);
      fetchGarnishes();
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
    if (editingProduct) await supabase.from('menu_items').update(payload).eq('id', editingProduct.id);
    else await supabase.from('menu_items').insert(payload);
    setIsModalOpen(false);
    fetchProducts();
  };

  const handleGarnishSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: garnishFormData.name,
      price: Number(garnishFormData.price),
      category_name: garnishFormData.category_name || null,
      item_name: garnishFormData.item_name || null,
      group_name: garnishFormData.group_name
    };
    if (editingGarnish) await supabase.from('menu_options').update(payload).eq('id', editingGarnish.id);
    else await supabase.from('menu_options').insert(payload);
    setIsGarnishModalOpen(false);
    fetchGarnishes();
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar with Tabs & Categories */}
      <div className="w-full md:w-64 space-y-6 shrink-0">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-2 flex">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === 'products' ? 'bg-forestGreen text-white shadow-lg shadow-forestGreen/20' : 'text-gray-400 hover:text-white'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('garnishes')}
            className={`flex-1 py-2 rounded-2xl text-xs font-bold transition-all ${activeTab === 'garnishes' ? 'bg-forestGreen text-white shadow-lg shadow-forestGreen/20' : 'text-gray-400 hover:text-white'}`}
          >
            Garnishes
          </button>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-4 flex flex-col h-64 md:h-[calc(100%-5rem)]">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
            <Filter size={16} /> {activeTab === 'products' ? 'Categories' : 'Filter Options'}
          </h2>
          <div className="overflow-y-auto pr-2 space-y-1 custom-scrollbar flex-1">
            <button
              onClick={() => { setSelectedCategory('all'); setPage(1); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategory === 'all' ? 'bg-forestGreen/20 text-forestGreen font-bold' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategory === cat ? 'bg-forestGreen/20 text-forestGreen font-bold' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <span className="truncate pr-2">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-800/80">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl py-2.5 pl-12 pr-4 focus:border-forestGreen transition-all text-sm"
            />
          </div>
          <button 
            onClick={() => {
              if (activeTab === 'products') {
                setEditingProduct(null);
                setFormData({ item_name: '', item_price: '', category_name: selectedCategory !== 'all' ? selectedCategory : '', choice_name: '', choice_price: '' });
                setIsModalOpen(true);
              } else {
                setEditingGarnish(null);
                setGarnishFormData({ name: '', price: '', category_name: '', item_name: '', group_name: 'Options' });
                setIsGarnishModalOpen(true);
              }
            }}
            className="w-full sm:w-auto bg-forestGreen hover:bg-forestGreen/90 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-forestGreen/20"
          >
            <Plus size={18} /> Add {activeTab === 'products' ? 'Product' : 'Garnish'}
          </button>
        </div>

        {/* Dynamic List */}
        <div className="flex-1 overflow-auto p-2">
          {loading ? (
            <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forestGreen"></div></div>
          ) : activeTab === 'products' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700/50 text-sm">
                  <th className="p-4 font-semibold w-1/3">Item Name</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Options</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{p.item_name}</div>
                      <div className="text-xs text-gray-500">{p.category_name}</div>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">{p.item_price ? `$${p.item_price.toFixed(2)}` : '-'}</td>
                    <td className="p-4">
                      {p.option_count ? (
                        <span className="bg-forestGreen/20 text-forestGreen text-[10px] font-black uppercase px-2 py-1 rounded-md border border-forestGreen/30">
                          {p.option_count} Options
                        </span>
                      ) : <span className="text-gray-600 text-xs">No options</span>}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700/50 text-sm">
                  <th className="p-4 font-semibold">Garnish Name</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Applied To</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {garnishes.map((g) => (
                  <tr key={g.id} className="border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{g.name}</div>
                      <div className="text-xs text-gray-500">{g.group_name}</div>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">${g.price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="text-xs text-gray-300">
                        {g.item_name ? `Item: ${g.item_name}` : g.category_name ? `Category: ${g.category_name}` : 'Global'}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleGarnishEdit(g)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleGarnishDelete(g.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer (Only for Products) */}
        {activeTab === 'products' && (
          <div className="p-4 border-t border-gray-700/50 flex items-center justify-between bg-gray-800/80">
            <span className="text-sm text-gray-400">Page <strong className="text-white">{page}</strong></span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50">Prev</button>
              <button disabled={page * ITEMS_PER_PAGE >= totalCount} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-lg relative shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-black text-white mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Item Name</label>
                  <input required value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Category</label>
                    <select required value={formData.category_name} onChange={e => setFormData({...formData, category_name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Base Price ($)</label>
                    <input type="number" step="0.01" value={formData.item_price} onChange={e => setFormData({...formData, item_price: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-3"><button type="submit" className="bg-forestGreen text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2"><Save size={18} /> Save</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Garnish Modal */}
      <AnimatePresence>
        {isGarnishModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900 border border-gray-700 rounded-3xl p-8 w-full max-w-lg relative shadow-2xl">
              <button onClick={() => setIsGarnishModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-black text-white mb-6">{editingGarnish ? 'Edit Garnish' : 'Add New Garnish'}</h2>
              <form onSubmit={handleGarnishSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Garnish Name</label>
                    <input required value={garnishFormData.name} onChange={e => setGarnishFormData({...garnishFormData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Group (e.g. Toppings)</label>
                    <input required value={garnishFormData.group_name} onChange={e => setGarnishFormData({...garnishFormData, group_name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Price ($)</label>
                    <input type="number" step="0.01" required value={garnishFormData.price} onChange={e => setGarnishFormData({...garnishFormData, price: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Link to Category (Optional)</label>
                    <select value={garnishFormData.category_name} onChange={e => setGarnishFormData({...garnishFormData, category_name: e.target.value, item_name: ''})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen">
                      <option value="">None (Global)</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Link to Specific Product Name (Optional)</label>
                    <input placeholder="Enter product name exactly" value={garnishFormData.item_name} onChange={e => setGarnishFormData({...garnishFormData, item_name: e.target.value, category_name: ''})} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:border-forestGreen" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-3"><button type="submit" className="bg-forestGreen text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2"><Save size={18} /> Save Garnish</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
