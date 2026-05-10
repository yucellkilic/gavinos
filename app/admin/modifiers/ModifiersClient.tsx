'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronRight,
  Layers, Tag, DollarSign, Sparkles,
} from 'lucide-react';
import {
  getCategories,
  getModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  getModifiers,
  createModifier,
  updateModifier,
  deleteModifier,
} from './actions';

interface ModifierGroupRow {
  id: string;
  name: string;
  category_name: string;
  display_order: number;
  min_select: number;
  max_select: number;
  is_active: boolean;
}

interface ModifierRow {
  id: string;
  group_id: string;
  name: string;
  price: number;
  is_active: boolean;
  display_order: number;
}

export default function ModifiersClient() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [groups, setGroups] = useState<ModifierGroupRow[]>([]);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [modifiers, setModifiers] = useState<Record<string, ModifierRow[]>>({});
  const [loading, setLoading] = useState(true);

  // New group form
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMin, setNewGroupMin] = useState(0);
  const [newGroupMax, setNewGroupMax] = useState(10);

  // New modifier form
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newModName, setNewModName] = useState('');
  const [newModPrice, setNewModPrice] = useState(0);

  // Edit states
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load groups when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadGroups(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0 && !selectedCategory) {
        setSelectedCategory(cats[0]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async (category: string) => {
    try {
      const data = await getModifierGroups(category);
      setGroups(data as ModifierGroupRow[]);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setGroups([]);
    }
  };

  const loadModifiers = useCallback(async (groupId: string) => {
    try {
      const data = await getModifiers(groupId);
      setModifiers(prev => ({ ...prev, [groupId]: data as ModifierRow[] }));
    } catch (err) {
      console.error('Failed to load modifiers:', err);
    }
  }, []);

  const handleExpandGroup = async (groupId: string) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      return;
    }
    setExpandedGroup(groupId);
    if (!modifiers[groupId]) {
      await loadModifiers(groupId);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !selectedCategory) return;
    try {
      await createModifierGroup({
        name: newGroupName.trim(),
        category_name: selectedCategory,
        min_select: newGroupMin,
        max_select: newGroupMax,
      });
      setNewGroupName('');
      setNewGroupMin(0);
      setNewGroupMax(10);
      setShowNewGroup(false);
      await loadGroups(selectedCategory);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Delete this group and all its modifiers?')) return;
    try {
      await deleteModifierGroup(id);
      await loadGroups(selectedCategory);
      if (expandedGroup === id) setExpandedGroup(null);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleSaveGroupName = async (id: string) => {
    if (!editGroupName.trim()) return;
    try {
      await updateModifierGroup(id, { name: editGroupName.trim() });
      setEditingGroup(null);
      await loadGroups(selectedCategory);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleCreateModifier = async (groupId: string) => {
    if (!newModName.trim()) return;
    try {
      await createModifier({
        group_id: groupId,
        name: newModName.trim(),
        price: newModPrice || 0,
      });
      setNewModName('');
      setNewModPrice(0);
      setAddingToGroup(null);
      await loadModifiers(groupId);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleDeleteModifier = async (modId: string, groupId: string) => {
    if (!confirm('Delete this modifier?')) return;
    try {
      await deleteModifier(modId);
      await loadModifiers(groupId);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    }
  };

  const handleToggleModifier = async (modId: string, groupId: string, currentActive: boolean) => {
    try {
      await updateModifier(modId, { is_active: !currentActive });
      await loadModifiers(groupId);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-forestGreen"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="text-amber-400" size={24} />
            Modifier Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Create topping groups per category. Each group contains individual modifiers with prices.
          </p>
        </div>
      </div>

      {/* Category Selector */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
          Select Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-80 bg-gray-900/50 border border-gray-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-forestGreen focus:ring-1 focus:ring-forestGreen transition-all"
        >
          <option value="">— Choose a category —</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <>
          {/* Add Group Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewGroup(true)}
              className="flex items-center gap-2 px-5 py-3 bg-forestGreen text-white rounded-xl font-bold hover:bg-forestGreen/90 transition-all shadow-lg shadow-forestGreen/20"
            >
              <Plus size={18} />
              New Topping Group
            </button>
          </div>

          {/* New Group Form */}
          <AnimatePresence>
            {showNewGroup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forestGreen/30"
              >
                <h3 className="text-lg font-bold text-white mb-4">
                  New Topping Group for "{selectedCategory}"
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Group Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Meats, Vegetables..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-forestGreen transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Min Select</label>
                    <input
                      type="number"
                      min={0}
                      value={newGroupMin}
                      onChange={(e) => setNewGroupMin(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-forestGreen transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Max Select</label>
                    <input
                      type="number"
                      min={1}
                      value={newGroupMax}
                      onChange={(e) => setNewGroupMax(parseInt(e.target.value) || 10)}
                      className="w-full bg-gray-900/50 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-forestGreen transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateGroup}
                    className="px-5 py-2.5 bg-forestGreen text-white rounded-xl font-bold hover:bg-forestGreen/90 transition-all"
                  >
                    Create Group
                  </button>
                  <button
                    onClick={() => setShowNewGroup(false)}
                    className="px-5 py-2.5 bg-gray-700 text-gray-300 rounded-xl font-bold hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Groups List */}
          <div className="space-y-3">
            {groups.length === 0 ? (
              <div className="bg-gray-800/30 rounded-2xl p-12 text-center border border-gray-700/30">
                <Layers className="mx-auto text-gray-600 mb-3" size={48} />
                <p className="text-gray-400 text-lg">No topping groups yet for "{selectedCategory}"</p>
                <p className="text-gray-500 text-sm mt-1">Click "New Topping Group" to get started.</p>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <button
                      onClick={() => handleExpandGroup(group.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      {expandedGroup === group.id ? (
                        <ChevronDown size={18} className="text-forestGreen flex-shrink-0" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                      )}
                      
                      {editingGroup === group.id ? (
                        <input
                          type="text"
                          value={editGroupName}
                          onChange={(e) => setEditGroupName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-gray-900/50 border border-forestGreen text-white rounded-lg py-1 px-3 focus:outline-none w-48"
                          autoFocus
                        />
                      ) : (
                        <span className="font-bold text-white text-lg">{group.name}</span>
                      )}
                      
                      <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full">
                        {group.min_select > 0 ? `Min ${group.min_select}` : 'Optional'} · Max {group.max_select}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      {editingGroup === group.id ? (
                        <>
                          <button
                            onClick={() => handleSaveGroupName(group.id)}
                            className="p-2 text-forestGreen hover:bg-forestGreen/10 rounded-lg transition-colors"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditingGroup(null)}
                            className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingGroup(group.id); setEditGroupName(group.name); }}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Edit group name"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete group"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded: Modifier List */}
                  <AnimatePresence>
                    {expandedGroup === group.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700/50"
                      >
                        <div className="p-6 space-y-3">
                          {/* Existing Modifiers */}
                          {(modifiers[group.id] || []).length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                              No modifiers yet. Add one below.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {(modifiers[group.id] || []).map((mod) => (
                                <div
                                  key={mod.id}
                                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                    mod.is_active
                                      ? 'bg-gray-900/30 border border-gray-700/30'
                                      : 'bg-gray-900/10 border border-gray-800/20 opacity-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Tag size={14} className="text-forestGreen flex-shrink-0" />
                                    <span className="text-white font-medium">{mod.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-forestGreen font-bold text-sm flex items-center gap-1">
                                      <DollarSign size={12} />
                                      {Number(mod.price).toFixed(2)}
                                    </span>
                                    <button
                                      onClick={() => handleToggleModifier(mod.id, group.id, mod.is_active)}
                                      className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${
                                        mod.is_active
                                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                      }`}
                                    >
                                      {mod.is_active ? 'Active' : 'Disabled'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteModifier(mod.id, group.id)}
                                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Modifier Form */}
                          {addingToGroup === group.id ? (
                            <div className="bg-gray-900/30 rounded-xl p-4 border border-forestGreen/20">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <input
                                  type="text"
                                  placeholder="Modifier name (e.g. Pepperoni)"
                                  value={newModName}
                                  onChange={(e) => setNewModName(e.target.value)}
                                  className="bg-gray-900/50 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-forestGreen transition-all"
                                  autoFocus
                                />
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="Price"
                                  value={newModPrice || ''}
                                  onChange={(e) => setNewModPrice(parseFloat(e.target.value) || 0)}
                                  className="bg-gray-900/50 border border-gray-700 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:border-forestGreen transition-all"
                                />
                              </div>
                              <div className="flex gap-3 mt-3">
                                <button
                                  onClick={() => handleCreateModifier(group.id)}
                                  className="px-4 py-2 bg-forestGreen text-white rounded-xl font-bold text-sm hover:bg-forestGreen/90 transition-all"
                                >
                                  Add Modifier
                                </button>
                                <button
                                  onClick={() => { setAddingToGroup(null); setNewModName(''); setNewModPrice(0); }}
                                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-600 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingToGroup(group.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-forestGreen hover:text-forestGreen transition-all"
                            >
                              <Plus size={16} />
                              Add Modifier
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
