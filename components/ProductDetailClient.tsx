'use client';

import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Check, ChevronDown, X } from 'lucide-react';
import { MenuItem, ModifierGroup, Modifier } from '@/types/menu';
import { SelectedModifier } from '@/types/cart';
import { useCartStore } from '@/stores/cartStore';
import MenuCard from '@/components/MenuCard';
import { supabaseBrowser } from '@/lib/supabase-browser';

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
  modifierGroups: initialModifierGroups = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [instructions, setInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(initialModifierGroups);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    window.scrollTo(0, 0);

    // Fetch modifiers for this category if not provided
    if (!initialModifierGroups || initialModifierGroups.length === 0) {
      const fetchModifiers = async () => {
        const catName = menuItem?.category_name;
        if (!catName) return;

        const { data, error } = await supabaseBrowser
          .from('modifier_groups')
          .select('*, modifiers(*)')
          .eq('category_name', catName)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (!error && data) {
          setModifierGroups(data);
        }
      };
      fetchModifiers();
    } else {
      setModifierGroups(initialModifierGroups);
    }
  }, [menuItem?.category_name, initialModifierGroups]);

  const basePrice = menuItem?.base_price ?? menuItem?.item_price ?? 0;
  const numPrice = typeof basePrice === 'number' ? basePrice : Number(basePrice) || 0;
  const displayName = menuItem?.name || menuItem?.item_name || 'Unnamed Item';
  
  const modifiersTotal = (selectedModifiers ?? []).reduce((sum, m) => sum + (Number(m?.price) || 0), 0);
  const unitPrice = numPrice + modifiersTotal;
  const totalPrice = unitPrice * quantity;

  const toggleModifier = useCallback((e: React.MouseEvent, group: ModifierGroup, modifier: Modifier) => {
    e.preventDefault();
    setSelectedModifiers(prev => {
      const isSelected = prev.some(m => m.modifier_name === modifier.name && m.group_name === group.name);
      
      if (isSelected) {
        return prev.filter(m => !(m.modifier_name === modifier.name && m.group_name === group.name));
      }

      // Check limits
      const groupCount = prev.filter(m => m.group_name === group.name).length;
      if (groupCount >= (group.max_select || 10)) {
        // If max_select is 1, replace existing
        if (group.max_select === 1) {
          return [
            ...prev.filter(m => m.group_name !== group.name),
            { group_name: group.name, modifier_name: modifier.name, price: Number(modifier.price) || 0 }
          ];
        }
        return prev;
      }

      return [...prev, { group_name: group.name, modifier_name: modifier.name, price: Number(modifier.price) || 0 }];
    });
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const cartItem = {
      id: `${menuItem?.id}-${Date.now()}`,
      menuItemId: menuItem?.id || '',
      name: displayName,
      base_price: unitPrice,
      numberOfPeople: 10,
      quantity,
      configuration: { requiredOptions: {}, optionalOptions: [], selectedAccompaniments: [] },
      selected_modifiers: selectedModifiers,
      totalPrice: totalPrice,
      image_url: '🍽️',
      special_instructions: instructions,
    };

    addItem(cartItem);
    router.push('/menu');
  }, [menuItem, displayName, unitPrice, quantity, totalPrice, selectedModifiers, instructions, addItem, router]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="relative mb-8">
          <button onClick={() => router.back()} className="absolute -left-12 top-0 p-2 hover:bg-gray-100 rounded-full hidden lg:block">
            <X size={24} className="text-gray-400" />
          </button>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-[var(--ez-gray-900)]"><span>{displayName}</span></h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ez-gray-900)]">
            <span>${numPrice.toFixed(2)}</span>
            <span className="text-[var(--ez-gray-200)]">|</span>
            <span className="text-[var(--ez-gray-600)] font-normal">${(numPrice/10).toFixed(2)} / person</span>
            <span className="text-[var(--ez-gray-200)]">|</span>
            <span className="text-[var(--ez-gray-600)] font-normal">Serves 10</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-[14px] text-[var(--ez-gray-600)] leading-relaxed">
            <span>Includes fresh ingredients prepared daily for your event. Perfect for meetings, gatherings, and celebrations.</span>
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="mb-8">
          <label className="block text-[14px] font-bold text-[var(--ez-gray-900)] mb-3"><span>Select quantity:</span></label>
          <div className="relative max-w-[300px]">
            <select 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-white border border-[var(--ez-gray-200)] rounded-[var(--radius-ez)] px-4 py-3 text-[14px] font-medium appearance-none focus:border-[var(--ez-green)] outline-none"
            >
              {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'package' : 'packages'}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
          <p className="mt-2 text-[13px] text-[var(--ez-gray-600)]"><span>Will serve {quantity * 10} people</span></p>
        </div>

        {/* Modifiers */}
        <div className="space-y-10">
          {modifierGroups?.map((group) => (
            <div key={group.id} className="border-t border-gray-100 pt-8">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[16px] font-bold text-[var(--ez-gray-900)] mb-1"><span>{group.name}</span></h3>
                  <p className="text-[12px] text-gray-500">
                    {group.min_select > 0 ? (
                      <span className="text-[var(--ez-orange)] font-bold italic uppercase tracking-wider">Required</span>
                    ) : (
                      <span>Add: Optional</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    (selectedModifiers?.filter(m => m.group_name === group.name).length ?? 0) >= (group.min_select ?? 0)
                      ? 'bg-[var(--ez-green-light)] text-[var(--ez-green)]'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span>{selectedModifiers?.filter(m => m.group_name === group.name).length ?? 0}</span>
                    <span> / </span>
                    <span>{group.max_select || '∞'}</span>
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {group.modifiers?.map((mod) => {
                  const isSelected = selectedModifiers?.some(m => m.modifier_name === mod.name && m.group_name === group.name);
                  return (
                    <button
                      key={mod.id}
                      onClick={(e) => toggleModifier(e, group, mod)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--ez-gray-50)] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-[var(--ez-green)] bg-[var(--ez-green)]' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className={`text-[14px] ${isSelected ? 'font-bold text-[var(--ez-gray-900)]' : 'text-[var(--ez-gray-600)]'}`}>
                          <span>{mod?.name}</span>
                        </span>
                      </div>
                      {Number(mod?.price) > 0 && (
                        <span className="text-[13px] text-gray-400 font-medium"><span>+${Number(mod?.price).toFixed(2)}</span></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="border-t border-gray-100 pt-8">
            {!showInstructions ? (
              <button 
                onClick={() => setShowInstructions(true)}
                className="flex items-center gap-2 text-[14px] font-bold text-[var(--ez-gray-900)] hover:text-[var(--ez-green)] transition-colors"
              >
                <Plus size={18} />
                <span>Add special instructions</span>
              </button>
            ) : (
              <div className="space-y-3">
                <label className="block text-[14px] font-bold text-[var(--ez-gray-900)]"><span>Special instructions</span></label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="E.g., no onions, extra sauce..."
                  className="w-full bg-white border border-[var(--ez-gray-200)] rounded-[var(--radius-ez)] p-4 text-[14px] focus:border-[var(--ez-green)] outline-none min-h-[100px]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] safe-area-bottom">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {/* Validation Warning */}
          {modifierGroups?.some(group => (selectedModifiers?.filter(m => m.group_name === group.name).length ?? 0) < (group.min_select ?? 0)) && (
            <p className="text-[11px] text-[var(--ez-orange)] font-bold text-center animate-pulse">
              <span>Required selections remaining</span>
            </p>
          )}
          
          <button
            onClick={handleAddToCart}
            disabled={modifierGroups?.some(group => (selectedModifiers?.filter(m => m.group_name === group.name).length ?? 0) < (group.min_select ?? 0))}
            className="w-full bg-[var(--ez-green)] text-white py-4 rounded-[var(--radius-ez)] font-bold text-[16px] hover:bg-[var(--ez-green-hover)] transition-all flex items-center justify-between px-8 disabled:opacity-50 disabled:grayscale"
          >
            <span>Add to Cart</span>
            <div className="flex flex-col items-end">
              <span>${totalPrice.toFixed(2)}</span>
              <span className="text-[11px] font-normal opacity-90">${(totalPrice/(quantity*10)).toFixed(2)} / person</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
