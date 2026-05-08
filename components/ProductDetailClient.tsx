'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { MenuItem } from '@/types/menu';
import { useCartStore } from '@/stores/cartStore';
import MenuCard from '@/components/MenuCard';

interface ProductDetailClientProps {
  menuItem: MenuItem;
  relatedItems?: MenuItem[];
}

export default function ProductDetailClient({ menuItem, relatedItems = [] }: ProductDetailClientProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const price = menuItem.base_price ?? menuItem.item_price ?? 0;
  const numPrice = typeof price === 'number' ? price : Number(price);
  const displayName = menuItem.name || menuItem.item_name || 'Unnamed Item';
  const category = menuItem.category_name || '';
  const totalPrice = numPrice * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      id: `${menuItem.id}-${Date.now()}`,
      menuItemId: menuItem.id,
      name: displayName,
      base_price: numPrice,
      numberOfPeople: 1,
      quantity,
      configuration: {
        requiredOptions: {},
        optionalOptions: [],
        selectedAccompaniments: [],
      },
      totalPrice: totalPrice,
      image_url: '🍽️',
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
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-forestGreen/20 to-classicRed/20 flex items-center justify-center">
              <div className="text-9xl">🍽️</div>

              {/* Category Badge */}
              {category && (
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 bg-classicRed text-white text-sm font-bold rounded-full shadow-lg">
                    {category}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Title & Category */}
            <div>
              <p className="text-sm font-semibold text-classicRed mb-2 uppercase tracking-wide">
                {category}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 font-poppins">
                {displayName}
              </h1>

              {menuItem.choice_name && (
                <p className="text-gray-600 text-lg">
                  Option: <span className="font-semibold">{menuItem.choice_name}</span>
                  {menuItem.choice_price && (
                    <span className="ml-2 text-forestGreen font-bold">
                      (+${Number(menuItem.choice_price).toFixed(2)})
                    </span>
                  )}
                </p>
              )}

              <div className="mt-4">
                <span className="text-3xl font-bold text-forestGreen">
                  ${numPrice.toFixed(2)}
                </span>
                {menuItem.item_price2 && (
                  <span className="text-gray-500 ml-3">
                    Size 2: ${Number(menuItem.item_price2).toFixed(2)}
                  </span>
                )}
                {menuItem.item_price3 && (
                  <span className="text-gray-500 ml-3">
                    Size 3: ${Number(menuItem.item_price3).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
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

            {/* Price Summary */}
            <div className="bg-forestGreen/5 p-6 rounded-xl border-2 border-forestGreen">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">${numPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">× {quantity} quantity:</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-forestGreen pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-forestGreen">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-xl font-bold text-lg bg-forestGreen text-white hover:bg-forestGreen/90 shadow-lg hover:shadow-xl transition-smooth flex items-center justify-center gap-3"
            >
              <ShoppingCart size={22} />
              Add to Cart — ${totalPrice.toFixed(2)}
            </button>
          </motion.div>
        </div>

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              More from {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
