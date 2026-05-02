import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart } from '@/types/cart';

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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      deliveryDetails: null,

      addItem: (item: CartItem) => {
        set((state) => {
          const newItems = [...state.items, item];
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
              const accompanimentsPrice = item.configuration.selectedAccompaniments?.reduce((sum, acc) => sum + (acc.price || 0), 0) || 0;
              // If base_price is null, total is null unless accompaniments exist
              let newTotalPrice: number | null = null;
              if (item.base_price !== null) {
                newTotalPrice = (item.base_price + accompanimentsPrice) * item.numberOfPeople * quantity;
              } else if (accompanimentsPrice > 0) {
                newTotalPrice = accompanimentsPrice * item.numberOfPeople * quantity;
              }
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
              const accompanimentsPrice = item.configuration.selectedAccompaniments?.reduce((sum, acc) => sum + (acc.price || 0), 0) || 0;
              let newTotalPrice: number | null = null;
              if (item.base_price !== null) {
                newTotalPrice = (item.base_price + accompanimentsPrice) * numberOfPeople * item.quantity;
              } else if (accompanimentsPrice > 0) {
                newTotalPrice = accompanimentsPrice * numberOfPeople * item.quantity;
              }
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
        return get().totalPrice;
      },
    }),
    {
      name: 'gavinos-cart-storage',
    }
  )
);
