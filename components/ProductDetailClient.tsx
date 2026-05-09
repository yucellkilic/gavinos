'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingCart, Coffee, Check } from 'lucide-react';
import { MenuItem } from '@/types/menu';
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
  beverages?: MenuItem[];
}

export default function ProductDetailClient({ 
  menuItem, 
  relatedItems = [],
  choices = [],
  beverages = [],
}: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<Choice[]>([]);
  const [selectedBeverage, setSelectedBeverage] = useState<MenuItem | null>(null);

  // Sayfa açıldığında her zaman en üstten başla
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const basePrice = menuItem.base_price ?? menuItem.item_price ?? 0;
  const numPrice = typeof basePrice === 'number' ? basePrice : Number(basePrice);
  const displayName = menuItem.name || menuItem.item_name || 'Unnamed Item';
  const category = menuItem.category_name || '';

  // Calculate dynamic price
  const choicesTotal = selectedChoices.reduce((sum, c) => sum + Number(c.price), 0);
  const beverageTotal = selectedBeverage ? (selectedBeverage.base_price ?? selectedBeverage.item_price ?? 0) : 0;
  const unitPrice = numPrice + choicesTotal + Number(beverageTotal);
  const totalPrice = unitPrice * quantity;

  const toggleChoice = (choice: Choice) => {
    setSelectedChoices(prev => 
      prev.some(c => c.name === choice.name)
        ? prev.filter(c => c.name !== choice.name)
        : [...prev, choice]
    );
  };

  const handleAddToCart = () => {
    // Collect all options for the cart representation
    const options = [
      ...selectedChoices.map(c => `${c.name} (+$${Number(c.price).toFixed(2)})`),
    ];
    if (selectedBeverage) {
      options.push(`Drink: ${selectedBeverage.name} (+$${Number(selectedBeverage.item_price).toFixed(2)})`);
    }

    const cartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItemId: menuItem.id,
      name: displayName,
      base_price: unitPrice,
      numberOfPeople: 1,
      quantity,
      configuration: {
        requiredOptions: {},
        optionalOptions: options,
        selectedAccompaniments: [],
      },
      totalPrice: totalPrice,
      image_url: '🍽️',
    };

    addItem(cartItem as any);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
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

            {/* Compact Details Area */}
            <div className="p-8 lg:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                    {displayName}
                  </h1>
                  <p className="text-2xl font-bold text-forestGreen">
                    ${numPrice.toFixed(2)}
                  </p>
                </div>

                {/* Choices / Garnishes as Chips */}
                {choices.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                      Add-ons & Options
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {choices.map((choice, idx) => {
                        const isSelected = selectedChoices.some(c => c.name === choice.name);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleChoice(choice)}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                              isSelected 
                                ? 'bg-forestGreen border-forestGreen text-white shadow-md' 
                                : 'bg-white border-gray-200 text-gray-700 hover:border-forestGreen/50 hover:bg-forestGreen/5'
                            }`}
                          >
                            {isSelected && <Check size={14} />}
                            {choice.name}
                            {choice.price > 0 && (
                              <span className={isSelected ? 'text-white/80' : 'text-gray-400'}>
                                +${Number(choice.price).toFixed(2)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Optional Drinks */}
                {beverages.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <Coffee size={16} className="text-classicRed" /> 
                      Need a drink? (Optional)
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {beverages.map((bev) => {
                        const isSelected = selectedBeverage?.id === bev.id;
                        return (
                          <button
                            key={bev.id}
                            onClick={() => setSelectedBeverage(isSelected ? null : bev)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected 
                                ? 'bg-classicRed/5 border-classicRed text-classicRed shadow-sm' 
                                : 'bg-white border-gray-200 hover:border-classicRed/50'
                            }`}
                          >
                            <div className="font-semibold text-sm truncate">{bev.name}</div>
                            <div className="text-xs mt-1 font-bold">
                              +${Number(bev.base_price).toFixed(2)}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Area */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Quantity</span>
                  <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-2xl font-black text-lg bg-gray-900 text-white hover:bg-forestGreen shadow-xl hover:shadow-forestGreen/30 transition-all flex items-center justify-between px-6 group"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
                    Add to Cart
                  </span>
                  <span>${totalPrice.toFixed(2)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
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
              {relatedItems.slice(0, 3).map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

