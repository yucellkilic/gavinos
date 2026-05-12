'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { useAuthStore } from '@/stores/authStore';

export function useFavorites() {
  const user = useAuthStore((s) => s.user);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await supabaseBrowser
        .from('favorites')
        .select('menu_item_id')
        .eq('user_id', user.id);

      if (data) {
        setFavoriteIds(new Set(data.map((f) => f.menu_item_id)));
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (menuItemId: string) => {
      if (!user) return false;

      const isFav = favoriteIds.has(menuItemId);

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.delete(menuItemId);
        } else {
          next.add(menuItemId);
        }
        return next;
      });

      try {
        if (isFav) {
          await supabaseBrowser
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('menu_item_id', menuItemId);
        } else {
          await supabaseBrowser
            .from('favorites')
            .insert({ user_id: user.id, menu_item_id: menuItemId });
        }
      } catch {
        // Revert on failure
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFav) {
            next.add(menuItemId);
          } else {
            next.delete(menuItemId);
          }
          return next;
        });
      }

      return !isFav;
    },
    [user, favoriteIds]
  );

  const isFavorite = useCallback(
    (menuItemId: string) => favoriteIds.has(menuItemId),
    [favoriteIds]
  );

  return { favoriteIds, isFavorite, toggleFavorite, isLoading };
}
