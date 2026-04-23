import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart } from '@/types/cart';

interface CartStore extends Cart {
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemPeople: (itemId: string, numberOfPeople: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,

      addItem: (item: CartItem) => {
        set((state) => {
          const newItems = [...state.items, item];
          const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
          return { items: newItems, totalPrice };
        });
      },

      removeItem: (itemId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId);
          const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
          return { items: newItems, totalPrice };
        });
      },

      updateItemQuantity: (itemId: string, quantity: number) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              const optionalPrice = item.configuration.optionalOptions.reduce((sum, optId) => {
                return sum + 0; // Will be calculated properly in product page
              }, 0);
              const totalPrice = (item.base_price + optionalPrice) * item.numberOfPeople * quantity;
              return { ...item, quantity, totalPrice };
            }
            return item;
          });
          const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
          return { items: newItems, totalPrice };
        });
      },

      updateItemPeople: (itemId: string, numberOfPeople: number) => {
        set((state) => {
          const newItems = state.items.map((item) => {
            if (item.id === itemId) {
              const optionalPrice = item.configuration.optionalOptions.reduce((sum, optId) => {
                return sum + 0;
              }, 0);
              const totalPrice = (item.base_price + optionalPrice) * numberOfPeople * item.quantity;
              return { ...item, numberOfPeople, totalPrice };
            }
            return item;
          });
          const totalPrice = newItems.reduce((sum, i) => sum + i.totalPrice, 0);
          return { items: newItems, totalPrice };
        });
      },

      clearCart: () => {
        set({ items: [], totalPrice: 0 });
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
