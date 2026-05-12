'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { formatCurrency } from '@/lib/utils';

/**
 * Mobile floating bottom bar showing cart summary.
 * Appears when items are in the cart (mobile only).
 */
export default function MobileCartBar() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const isVisible = items.length > 0;

  return (
    <div className={`ez-mobile-bar lg:hidden ${isVisible ? 'visible' : ''}`}>
      <Link
        href="/cart"
        className="flex items-center justify-between w-full ez-btn ez-btn-primary ez-btn-lg rounded-xl"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-ezGreen text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              <span>{itemCount}</span>
            </span>
          </div>
          <span className="font-semibold text-sm">
            <span>View Cart</span>
          </span>
        </div>
        <span className="font-bold text-sm">
          <span>{formatCurrency(totalPrice ?? 0)}</span>
        </span>
      </Link>
    </div>
  );
}
