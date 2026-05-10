import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart, SelectedModifier } from '@/types/cart';

export interface DeliveryDetails {
  deliveryType: 'delivery' | 'pickup';
  phoneNumber: string;
  address?: string;
  deliveryDate: string;
  deliveryTime: string;
}

interface CartStore extends Cart {
  deliveryDetails: DeliveryDetails | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemPeople: (itemId: string, numberOfPeople: number) => void;
  setDeliveryDetails: (details: DeliveryDetails) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

/**
 * Recalculate total price for a cart item including modifiers + accompaniments.
 */
function recalcItemTotal(item: CartItem, quantity: number, numberOfPeople: number): number | null {
  const modifiersPrice = (item.selected_modifiers ?? []).reduce(
    (sum, m) => sum + (Number(m?.price) || 0), 0
  );
  const accompanimentsPrice = (item.configuration?.selectedAccompaniments ?? []).reduce(
    (sum, acc) => sum + (Number(acc?.price) || 0), 0
  );

  const base = Number(item.base_price) || 0;
  if (base > 0 || modifiersPrice > 0 || accompanimentsPrice > 0) {
    return (base + modifiersPrice + accompanimentsPrice) * numberOfPeople * quantity;
  }
  return null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      deliveryDetails: null,

      addItem: (item: CartItem) => {
        // Ensure selected_modifiers always exists
        const safeItem: CartItem = {
          ...item,
          selected_modifiers: item.selected_modifiers ?? [],
          configuration: item.configuration ?? {
            requiredOptions: {},
            optionalOptions: [],
            selectedAccompaniments: [],
          },
        };
        set((state) => {
          const newItems = [...state.items, safeItem];
          const totalPrice = newItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
          return { items: newItems, totalPrice };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          const totalPrice = newItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
          return { items: newItems, totalPrice };
        });
      },

      updateItemQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              const people = item.numberOfPeople || 1;
              const newTotalPrice = recalcItemTotal(item, quantity, people);
              return { ...item, quantity, totalPrice: newTotalPrice };
            }
            return item;
          });
          const totalPrice = newItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
          return { items: newItems, totalPrice };
        });
      },

      updateItemPeople: (itemId: string, numberOfPeople: number) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              const newTotalPrice = recalcItemTotal(item, item.quantity, numberOfPeople);
              return { ...item, numberOfPeople, totalPrice: newTotalPrice };
            }
            return item;
          });
          const totalPrice = newItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
          return { items: newItems, totalPrice };
        });
      },

      clearCart: () => {
        set({ items: [], totalPrice: 0, deliveryDetails: null });
      },

      setDeliveryDetails: (details: DeliveryDetails) => {
        set({ deliveryDetails: details });
      },

      getCartTotal: () => {
        return get().totalPrice ?? 0;
      },
    }),
    {
      name: 'gavinos-cart-storage',
    }
  )
);
