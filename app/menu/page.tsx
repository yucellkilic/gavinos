import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem } from '@/types/menu';

export const revalidate = 60;

// Fetch unique categories directly from Supabase
async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('category_name')
    .not('category_name', 'is', null)
    .order('category_name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return Array.from(new Set(data.map((item: any) => item.category_name as string)));
}

// Fetch menu items with server-side filtering and pagination
async function getMenuItems(category?: string, search?: string, limit = 50) {
  let query = supabase.from('menu_items').select('*', { count: 'exact' });

  // Category filter — exact match with database column
  if (category && category !== 'all') {
    query = query.eq('category_name', category);
  }

  // Search filter — server-side ilike on item_name
  if (search) {
    query = query.ilike('item_name', `%${search}%`);
  }

  const { data, error, count } = await query
    .order('item_name')
    .range(0, limit - 1);

  if (error) {
    console.error('Supabase error:', error);
    return { items: [] as MenuItem[], total: 0 };
  }

  // Map database column names to UI-friendly aliases
  const items: MenuItem[] = (data || []).map((item: any) => ({
    ...item,
    name: item.item_name || 'Unnamed Item',
    base_price: item.item_price ?? 0,
  }));

  return { items, total: count || 0 };
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; limit?: string };
}) {
  const category = searchParams.category || 'all';
  const search = searchParams.search || '';
  const limit = parseInt(searchParams.limit || '50');

  const [{ items, total }, categories] = await Promise.all([
    getMenuItems(category, search, limit),
    getCategories(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forestGreen"></div>
      </div>
    }>
      <MenuClient
        initialItems={items}
        totalItems={total}
        categories={categories}
        initialCategory={category}
        initialSearch={search}
      />
    </Suspense>
  );
}
