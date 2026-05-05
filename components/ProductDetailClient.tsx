'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useCartStore } from '@/stores/cartStore';
import { usePriceCalculator } from '@/hooks/usePriceCalculator';
import RequiredOptions from '@/components/RequiredOptions';
import OptionalOptions from '@/components/OptionalOptions';
import { formatCurrency } from '@/lib/priceCalculator';

export default function ProductDetailClient({ menuItem }: { menuItem: MenuItem }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  const [selectedRequiredOptions, setSelectedRequiredOptions] = useState<Record<string, string>>({});
  
  const {
    numberOfPeople,
    setNumberOfPeople,
    quantity,
    setQuantity,
    selectedOptionalOptions,
    toggleOptionalOption,
    selectedAccompaniments,
    toggleAccompaniment,
    isAccompanimentSelected,
    calculation,
  } = usePriceCalculator(menuItem.base_price ?? null);

  const hasRequiredOptions = menuItem.required_options && menuItem.required_options.length > 0;
  const allRequiredOptionsSelected = hasRequiredOptions
    ? menuItem.required_options!.every((opt) => selectedRequiredOptions[opt.id])
    : true;

  const handleAddToCart = () => {
    if (!allRequiredOptionsSelected) return;

    const cartItem = {
      id: `${menuItem.id || 'new'}-${Date.now()}`,
      menuItemId: menuItem.id || '',
      name: menuItem.name || 'Unnamed Item',
      base_price: menuItem.base_price ?? 0,
      numberOfPeople,
      quantity,
      configuration: {
        requiredOptions: selectedRequiredOptions,
        optionalOptions: selectedOptionalOptions.map((opt) => opt.id),
        selectedAccompaniments: selectedAccompaniments,
      },
      totalPrice: calculation.total,
      image_url: menuItem.image_url || '🍕',
    };

    addItem(cartItem as any);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-forestGreen hover:text-forestGreen/80 mb-6 transition-smooth"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-96 lg:h-[600px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center">
              <div className="text-9xl">{menuItem.image_url}</div>
              {menuItem.badges && menuItem.badges.length > 0 && (
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {menuItem.badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-4 py-2 bg-classicRed text-white text-sm font-bold rounded-full shadow-lg"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Configuration Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 font-poppins">
                {menuItem.name}
              </h1>
              <p className="text-lg text-gray-600">{menuItem.description}</p>
              <div className="mt-4">
                <span className="text-3xl font-bold text-forestGreen">
                  {formatCurrency(menuItem.base_price ?? 0)}
                </span>
                {(menuItem.base_price ?? null) !== null && (
                  <span className="text-gray-500 ml-2">per piece</span>
                )}
              </div>
            </div>

            {/* Number of People */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Number of People
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={numberOfPeople}
                  onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg py-2"
                />
                <button
                  onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth"
                >
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg py-2"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-smooth"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Required Options */}
            {hasRequiredOptions && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <RequiredOptions
                  options={menuItem.required_options!}
                  selectedOptions={selectedRequiredOptions}
                  onOptionChange={(optionId, choiceId) =>
                    setSelectedRequiredOptions((prev) => ({ ...prev, [optionId]: choiceId }))
                  }
                />
              </div>
            )}

            {/* Optional Options */}
            {menuItem.optional_options && menuItem.optional_options.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md">
                <OptionalOptions
                  options={menuItem.optional_options}
                  selectedOptions={selectedOptionalOptions.map((opt) => opt.id)}
                  onOptionToggle={toggleOptionalOption}
                />
              </div>
            )}

            {/* Accompaniments Section */}
            {menuItem.accompaniment_groups && menuItem.accompaniment_groups.map((group) => (
              <div key={group.id} className="bg-white p-6 rounded-xl shadow-md mb-4 last:mb-0">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  {group.label} (Optional)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {group.items.map((acc) => (
                    <label key={acc.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer transition-smooth">
                      <input
                        type="checkbox"
                        checked={isAccompanimentSelected(acc.id)}
                        onChange={() => toggleAccompaniment(acc)}
                        className="w-5 h-5 rounded border-gray-300 text-forestGreen focus:ring-forestGreen"
                      />
                      <div className="flex-1 flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-900">{acc.name}</span>
                          {typeof acc.price === 'number' && acc.price > 0 && (
                            <span className="ml-2 text-sm text-gray-500">(+{formatCurrency(acc.price ?? 0)})</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Price Summary */}
            <div className="bg-forestGreen/5 p-6 rounded-xl border-2 border-forestGreen">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">{formatCurrency(calculation.basePrice ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">× {numberOfPeople} people:</span>
                  <span className="font-medium">{calculation.subtotal !== null ? formatCurrency(calculation.subtotal ?? 0) : 'Market Price'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">× {quantity} quantity:</span>
                  <span className="font-medium">{calculation.total !== null ? formatCurrency(calculation.total ?? 0) : 'Market Price'}</span>
                </div>
                <div className="border-t-2 border-forestGreen pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-forestGreen">
                      {calculation.total !== null ? formatCurrency(calculation.total ?? 0) : 'Market Price'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!allRequiredOptionsSelected}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-smooth ${
                allRequiredOptionsSelected
                  ? 'bg-forestGreen text-white hover:bg-forestGreen/90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {allRequiredOptionsSelected ? 'Add to Cart' : 'Please select all required options'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
