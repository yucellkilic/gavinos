import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  email?: string;
  name?: string;
  phone?: string;
  isAuthenticated: boolean;
  setUser: (user: { email?: string; name?: string; phone?: string }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      email: undefined,
      name: undefined,
      phone: undefined,
      isAuthenticated: false,

      setUser: (user) => {
        set({
          email: user.email,
          name: user.name,
          phone: user.phone,
          isAuthenticated: true,
        });
      },

      clearUser: () => {
        set({
          email: undefined,
          name: undefined,
          phone: undefined,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'gavinos-user-storage',
    }
  )
);
