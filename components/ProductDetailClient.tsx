'use client';

import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingCart, Coffee, Check, Sparkles, ChevronDown } from 'lucide-react';
import { MenuItem, ModifierGroup, Modifier } from '@/types/menu';
import { SelectedModifier } from '@/types/cart';
import { useCartStore } from '@/stores/cartStore';
import MenuCard from '@/components/MenuCard';

interface Choice {
  name: string;
  price: number;
}

interface ProductDetailClientProps {
  menuItem: MenuItem;
  relatedItems?: MenuItem[];
  choices?: Choice[];
  modifierGroups?: ModifierGroup[];
  beverages?: MenuItem[];
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl text-center max-w-sm">
            <h2 className="text-xl font-black text-classicRed mb-2">UI Error</h2>
            <p className="text-sm text-gray-600 mb-4">{this.state.error?.message}</p>
            <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-bold">Reload Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ProductDetailClient(props: ProductDetailClientProps) {
  return (
    <ErrorBoundary>
      <ProductDetailClientInner {...props} />
    </ErrorBoundary>
  );
}

function ProductDetailClientInner({ 
  menuItem, 
  relatedItems = [],
  choices = [],
  modifierGroups = [],
  beverages = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<Choice[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [selectedBeverage, setSelectedBeverage] = useState<MenuItem | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    setIsMounted(true);
    window.scrollTo(0, 0);
  }, []);

  // Auto-expand first modifier group
  useEffect(() => {
    if (modifierGroups?.length > 0) {
      setExpandedGroups(new Set([modifierGroups[0].id]));
    }
  }, [modifierGroups]);

  // Safe price extraction with fallbacks
  const basePrice = menuItem?.base_price ?? menuItem?.item_price ?? 0;
  const numPrice = typeof basePrice === 'number' ? basePrice : Number(basePrice) || 0;
  const displayName = menuItem?.name || menuItem?.item_name || 'Unnamed Item';
  const category = menuItem?.category_name || '';

  // Calculate dynamic price — modifiers + choices + beverage
  const modifiersTotal = (selectedModifiers ?? []).reduce((sum, m) => sum + (Number(m?.price) || 0), 0);
  const choicesTotal = (selectedChoices ?? []).reduce((sum, c) => sum + (Number(c?.price) || 0), 0);
  const beverageTotal = selectedBeverage 
    ? (Number(selectedBeverage?.base_price) || Number(selectedBeverage?.item_price) || 0)
    : 0;
  const unitPrice = numPrice + modifiersTotal + choicesTotal + Number(beverageTotal);
  const totalPrice = unitPrice * quantity;

  const toggleChoice = useCallback((e: React.MouseEvent, choice: Choice) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!choice?.name) return;
      setSelectedChoices(prev => 
        prev.some(c => c.name === choice.name)
          ? prev.filter(c => c.name !== choice.name)
          : [...prev, choice]
      );
    } catch (err: any) {
      alert(`Error selecting choice: ${err?.message}`);
    }
  }, []);

  const toggleModifier = useCallback((e: React.MouseEvent, group: ModifierGroup, modifier: Modifier) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!modifier?.name || !group?.name) return;
      
      setSelectedModifiers(prev => {
        const exists = prev.some(
          m => m.modifier_name === modifier.name && m.group_name === group.name
        );
        
        if (exists) {
          return prev.filter(
            m => !(m.modifier_name === modifier.name && m.group_name === group.name)
          );
        }

        // Check max_select limit
        const groupCount = prev.filter(m => m.group_name === group.name).length;
        if (groupCount >= (group.max_select || 10)) return prev;

        return [...prev, {
          group_name: group.name,
          modifier_name: modifier.name,
          price: Number(modifier.price) || 0,
        }];
      });
    } catch (err: any) {
      alert(`Error selecting modifier: ${err?.message}`);
    }
  }, []);

  const toggleGroup = useCallback((e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setExpandedGroups(prev => {
        const next = new Set(prev);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        return next;
      });
    } catch (err: any) {
      alert(`Error toggling group: ${err?.message}`);
    }
  }, []);

  const isModifierSelected = useCallback((groupName: string, modifierName: string) => {
    return (selectedModifiers ?? []).some(
      m => m.group_name === groupName && m.modifier_name === modifierName
    );
  }, [selectedModifiers]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      // Collect legacy options text
      const options = [
        ...(selectedChoices ?? []).map(c => `${c?.name || ''} (+$${Number(c?.price || 0).toFixed(2)})`),
      ];
      if (selectedBeverage) {
        options.push(`Drink: ${selectedBeverage?.name || ''} (+$${Number(selectedBeverage?.item_price || 0).toFixed(2)})`);
      }

      const cartItem = {
        id: `${menuItem?.id || 'unknown'}-${Date.now()}`,
        menuItemId: menuItem?.id || '',
        name: displayName,
        base_price: unitPrice,
        numberOfPeople: 1,
        quantity,
        configuration: {
          requiredOptions: {},
          optionalOptions: options,
          selectedAccompaniments: [],
        },
        selected_modifiers: selectedModifiers ?? [],
        totalPrice: totalPrice,
        image_url: '🍽️',
      };

      addItem(cartItem);
      router.push('/cart');
    } catch (err: any) {
      alert(`Error adding to cart: ${err?.message}`);
      console.error('Error adding to cart:', err);
    }
  }, [menuItem, displayName, unitPrice, quantity, totalPrice, selectedChoices, selectedModifiers, selectedBeverage, addItem, router]);

  // Safe arrays
  const safeModifierGroups = Array.isArray(modifierGroups) ? modifierGroups : [];
  const safeChoices = Array.isArray(choices) ? choices : [];
  const safeBeverages = Array.isArray(beverages) ? beverages : [];
  const safeRelatedItems = Array.isArray(relatedItems) ? relatedItems : [];

  // Filter choices that don't overlap with modifier names (avoid duplicates)
  const modifierNames = new Set(
    safeModifierGroups.flatMap(g => (g?.modifiers ?? []).map(m => m?.name?.toLowerCase()))
  );
  const filteredChoices = safeChoices.filter(c => c?.name && !modifierNames.has(c.name.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center text-forestGreen hover:text-forestGreen/80 mb-4 font-semibold transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to Menu
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Minimalist Image Area */}
            <div className="bg-gradient-to-br from-forestGreen/10 to-classicRed/10 flex items-center justify-center p-12 relative min-h-[300px]">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-9xl drop-shadow-2xl"
              >
                🍽️
              </motion.div>
              {category && (
                <span className="absolute top-6 left-6 px-4 py-1.5 bg-white/90 backdrop-blur-sm text-classicRed text-xs font-black uppercase tracking-wider rounded-full shadow-sm border border-red-100">
                  {category}
                </span>
              )}
            </div>

            {/* Details Area */}
            <div className="p-8 lg:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                    <span>{displayName}</span>
                  </h1>
                  <p className="text-2xl font-bold text-forestGreen">
                    <span>${numPrice.toFixed(2)}</span>
                  </p>
                </div>

                {/* ─── NEW: Customize Your Order (Modifier Groups from new tables) ─── */}
                {isMounted && safeModifierGroups.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      Customize Your Order
                    </h3>
                    <div className="space-y-2">
                      {safeModifierGroups.map((group) => {
                        if (!group?.id || !group?.name) return null;
                        const isExpanded = expandedGroups.has(group.id);
                        const groupModifiers = Array.isArray(group.modifiers) ? group.modifiers : [];
                        const selectedCount = (selectedModifiers ?? []).filter(
                          m => m.group_name === group.name
                        ).length;

                        return (
                          <div
                            key={group.id}
                            className="border border-gray-200 rounded-2xl overflow-hidden transition-all"
                          >
                            {/* Group Header */}
                            <button
                              type="button"
                              onClick={(e) => toggleGroup(e, group.id)}
                              style={{ WebkitTapHighlightColor: 'transparent' }}
                              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors touch-action-manipulation cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-800">
                                  <span>{group.name}</span>
                                </span>
                                {selectedCount > 0 ? (
                                  <span className="bg-forestGreen text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    <span>{selectedCount}</span>
                                  </span>
                                ) : (
                                  <span className="hidden" />
                                )}
                              </div>
                              <div className="flex items-center gap-2" suppressHydrationWarning={true}>
                                <span className="text-xs text-gray-400">
                                  <span>
                                    {group.min_select > 0 ? `Min ${group.min_select}` : 'Optional'} · Max {group.max_select || 10}
                                  </span>
                                </span>
                                <ChevronDown
                                  size={16}
                                  className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </div>
                            </button>

                            {/* Group Modifiers */}
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="px-4 py-3"
                              >
                                <div className="flex flex-wrap gap-2">
                                  {(!groupModifiers || !Array.isArray(groupModifiers)) ? null : groupModifiers.map((mod) => {
                                    if (!mod?.id || !mod?.name) return null;
                                    const isSelected = isModifierSelected(group.name, mod.name);
                                    return (
                                      <button
                                        type="button"
                                        key={`mod-${mod.id}`}
                                        onClick={(e) => toggleModifier(e, group, mod)}
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 touch-action-manipulation cursor-pointer select-none ${
                                          isSelected
                                            ? 'bg-forestGreen border-forestGreen text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-forestGreen/50 hover:bg-forestGreen/5'
                                        }`}
                                      >
                                        {isSelected && <Check size={14} />}
                                        <span>{mod.name}</span>
                                        {Number(mod.price) > 0 ? (
                                          <span className={isSelected ? 'text-white/80' : 'text-gray-400'}>
                                            <span>+${Number(mod.price).toFixed(2)}</span>
                                          </span>
                                        ) : (
                                          <span className="hidden" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ─── LEGACY: Add-ons (from old choices table, no overlap with modifiers) ─── */}
                {isMounted && filteredChoices.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Add-ons
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(!filteredChoices || !Array.isArray(filteredChoices)) ? null : filteredChoices.map((choice, idx) => {
                        if (!choice?.name) return null;
                        const isSelected = selectedChoices.some(c => c.name === choice.name);
                        return (
                          <button
                            type="button"
                            key={`choice-${choice.name}`}
                            onClick={(e) => toggleChoice(e, choice)}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 touch-action-manipulation cursor-pointer select-none ${
                              isSelected 
                                ? 'bg-forestGreen border-forestGreen text-white shadow-md' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-forestGreen/50 hover:bg-forestGreen/5'
                            }`}
                          >
                            {isSelected && <Check size={14} />}
                            <span>{choice.name}</span>
                            {Number(choice.price) > 0 ? (
                              <span className={isSelected ? 'text-white/80' : 'text-gray-400'}>
                                <span>+${Number(choice.price).toFixed(2)}</span>
                              </span>
                            ) : (
                              <span className="hidden" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Optional Drinks */}
                {isMounted && safeBeverages.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <Coffee size={16} className="text-classicRed" /> 
                      Need a drink? (Optional)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(!safeBeverages || !Array.isArray(safeBeverages)) ? null : safeBeverages.map((bev) => {
                        if (!bev?.id) return null;
                        const isSelected = selectedBeverage?.id === bev.id;
                        const bevPrice = Number(bev?.base_price) || Number(bev?.item_price) || 0;
                        return (
                          <button
                            type="button"
                            key={`bev-${bev.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              try {
                                setSelectedBeverage(isSelected ? null : bev);
                              } catch (err: any) {
                                alert(`Error selecting beverage: ${err?.message}`);
                              }
                            }}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                            className={`p-3 rounded-xl border text-left transition-all touch-action-manipulation cursor-pointer select-none ${
                              isSelected 
                                ? 'bg-classicRed/5 border-classicRed text-classicRed shadow-sm' 
                                : 'bg-white border-gray-200 hover:border-classicRed/50'
                            }`}
                          >
                            <div className="font-semibold text-sm truncate">
                              <span>{bev?.name || bev?.item_name || 'Drink'}</span>
                            </div>
                            <div className="text-xs mt-1 font-bold">
                              <span>+${bevPrice.toFixed(2)}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Live Price + Add to Cart ─── */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                {/* Live price breakdown */}
                {(modifiersTotal > 0 || choicesTotal > 0 || beverageTotal > 0) && (
                  <div className="bg-forestGreen/5 rounded-xl p-3 space-y-1 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Base</span>
                      <span>${numPrice.toFixed(2)}</span>
                    </div>
                    {modifiersTotal > 0 ? (
                      <div className="flex justify-between text-gray-600">
                        <span>Toppings</span>
                        <span>+${modifiersTotal.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="hidden" />
                    )}
                    {choicesTotal > 0 ? (
                      <div className="flex justify-between text-gray-600">
                        <span>Add-ons</span>
                        <span>+${choicesTotal.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="hidden" />
                    )}
                    {beverageTotal > 0 ? (
                      <div className="flex justify-between text-gray-600">
                        <span>Drink</span>
                        <span>+${Number(beverageTotal).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="hidden" />
                    )}
                    <div className="flex justify-between font-bold text-forestGreen pt-1 border-t border-forestGreen/20">
                      <span>Unit Total</span>
                      <span>${unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Quantity</span>
                  <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        try {
                          setQuantity(prev => Math.max(1, prev - 1));
                        } catch (err: any) {
                          alert(`Error updating quantity: ${err?.message}`);
                        }
                      }}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all touch-action-manipulation cursor-pointer select-none"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">
                      <span>{quantity}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        try {
                          setQuantity(prev => prev + 1);
                        } catch (err: any) {
                          alert(`Error updating quantity: ${err?.message}`);
                        }
                      }}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all touch-action-manipulation cursor-pointer select-none"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  className="w-full py-4 rounded-2xl font-black text-lg bg-gray-900 text-white hover:bg-forestGreen shadow-xl hover:shadow-forestGreen/30 transition-all flex items-center justify-between px-6 group touch-action-manipulation cursor-pointer select-none"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                    <span>Add to Cart</span>
                  </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {safeRelatedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
          >
            <h2 className="text-xl font-black text-gray-900 mb-6 px-2">
              More from {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {safeRelatedItems.slice(0, 3).map((item) => (
                item?.id ? <MenuCard key={item.id} item={item} /> : null
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
