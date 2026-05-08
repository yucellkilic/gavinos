'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Percent, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function BulkPricingClient() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [percentage, setPercentage] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('menu_items').select('category_name').not('category_name', 'is', null);
      if (data) {
        const unique = Array.from(new Set(data.map((i: any) => i.category_name as string))).sort();
        setCategories(['all', ...unique]);
      }
    }
    fetchCategories();
  }, []);

  const handleApply = async () => {
    if (!percentage || isNaN(Number(percentage))) {
      setStatus({ type: 'error', message: 'Please enter a valid percentage.' });
      return;
    }
    
    // Safety check limit
    if (Number(percentage) > 50 || Number(percentage) < -50) {
      if (!window.confirm(`You are about to apply a ${percentage}% change. This is unusually high/low. Are you sure?`)) {
        return;
      }
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const { error } = await supabase.rpc('bulk_update_prices', {
        percentage_increase: Number(percentage),
        target_category: selectedCategory === 'all' ? null : selectedCategory
      });

      if (error) throw error;
      
      setStatus({ type: 'success', message: `Successfully updated prices by ${percentage}% for ${selectedCategory === 'all' ? 'All Products' : selectedCategory}.` });
      setPercentage('');
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'An error occurred during update.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Smart Pricing Engine</h1>
        <p className="text-gray-400 mt-2">Apply percentage-based price adjustments across your entire menu or specific categories.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/40 backdrop-blur-md rounded-3xl border border-gray-700/50 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-forestGreen/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Target Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-4 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '🔥 All Products (Entire Menu)' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Percentage Input */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-300 uppercase tracking-wider">Adjustment Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 5 for +5% or -5 for -5%"
                  className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all text-lg font-bold"
                />
                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <p className="text-xs text-gray-500">Positive numbers increase prices, negative decrease them.</p>
            </div>
          </div>

          {/* Status Messages */}
          {status.type && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl flex items-center gap-3 border ${
                status.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
              <span className="font-medium">{status.message}</span>
            </motion.div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t border-gray-700/50">
            <button
              onClick={handleApply}
              disabled={loading || percentage === ''}
              className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                loading || percentage === ''
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-forestGreen hover:bg-forestGreen/90 text-white shadow-forestGreen/20 hover:shadow-forestGreen/40 active:scale-95'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <><Save size={22} /> Apply Bulk Update</>
              )}
            </button>
            <p className="mt-4 text-xs text-gray-500 flex items-center gap-2">
              <AlertTriangle size={14} className="text-orange-400" />
              Warning: This action will permanently update prices in the database.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
