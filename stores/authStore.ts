'use client';

import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Profile } from '@/types/menu';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      if (session?.user) {
        set({ user: session.user, session, isLoading: false, isInitialized: true });
        // Fetch profile in background
        get().fetchProfile();
      } else {
        set({ user: null, session: null, isLoading: false, isInitialized: true });
      }

      // Listen for auth changes
      supabaseBrowser.auth.onAuthStateChange((_event, session) => {
        set({ user: session?.user ?? null, session });
        if (session?.user) {
          get().fetchProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signUp: async (email, password, fullName) => {
    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) return { error: error.message };
      
      // If session exists, user is already logged in (auto-confirm is ON)
      if (data.session) {
        set({ user: data.user, session: data.session });
      }
      
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Registration failed' };
    }
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (err: any) {
      return { error: err?.message || 'Login failed' };
    }
  },

  signOut: async () => {
    await supabaseBrowser.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    const { data } = await supabaseBrowser
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      set({ profile: data as Profile });
    }
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabaseBrowser
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) return { error: error.message };

    await get().fetchProfile();
    return { error: null };
  },
}));
