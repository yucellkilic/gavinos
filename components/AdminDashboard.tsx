'use client';

import { useState } from 'react';
import { MenuItem } from '@/types/menu';
import { updateItemPrice, addItem, deleteItem } from '@/app/admin/manage/actions';
import { Search, Plus, Save, Trash2, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard({ initialItems }: { initialItems: MenuItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    base_price: 0,
    description: '',
    image_url: '🍽️',
    is_policy_object: false,
    badges: [],
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdatePrice = async (id: string) => {
    try {
      await updateItemPrice(id, newPrice);
      setItems(items.map(item => item.id === id ? { ...item, base_price: newPrice } : item));
      setEditingId(null);
      alert('Price updated successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Generate a simple ID if not provided, though Supabase might handle it
      const itemToAdd = { ...newItem, id: crypto.randomUUID() };
      await addItem(itemToAdd as MenuItem);
      setItems([itemToAdd as MenuItem, ...items]);
      setIsAdding(false);
      setNewItem({ name: '', base_price: 0, description: '', image_url: '🍽️', is_policy_object: false, badges: [] });
      alert('Product added successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Header */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products to manage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forestGreen/20 focus:border-forestGreen transition-all"
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-forestGreen text-white rounded-xl font-bold hover:bg-forestGreen/90 transition-all shadow-lg shadow-forestGreen/20"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Base Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full p-3 border border-gray-200 rounded-xl"
                    value={newItem.base_price || 0}
                    onChange={(e) => setNewItem({ ...newItem, base_price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-xl"
                    rows={3}
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-forestGreen text-white rounded-xl font-bold hover:bg-forestGreen/90 transition-all"
                >
                  Create Product
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.slice(0, 100).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.image_url}</span>
                      <div>
                        <div className="font-bold text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-24 p-1 border border-forestGreen rounded bg-forestGreen/5 outline-none font-bold text-forestGreen"
                          value={newPrice}
                          onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="font-bold text-gray-900">${item.base_price?.toFixed(2) || '0.00'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={() => handleUpdatePrice(item.id)}
                            className="p-2 text-forestGreen hover:bg-forestGreen/10 rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save size={20} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setNewPrice(item.base_price || 0);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Price"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-classicRed hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length > 100 && (
            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50">
              Showing first 100 of {filteredItems.length} items. Use search to find specific products.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
