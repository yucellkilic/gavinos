import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem } from '@/types/menu';

export const revalidate = 60;

async function getCategories() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('category_name')
    .not('category_name', 'is', null)
    .order('category_name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique category names
  const uniqueCategories = Array.from(new Set(data.map(item => item.category_name)));
  return uniqueCategories.map(cat => ({
    id: cat,
    label: cat,
    icon: '🍴' // Default icon for all fetched categories
  }));
}

async function getMenuItems(category?: string, search?: string, limit = 50) {
  let query = supabase.from('menu_items').select('*', { count: 'exact' });

  if (category && category !== 'all') {
    query = query.eq('category_name', category);
  }

  if (search) {
    query = query.ilike('item_name', `%${search}%`);
  }

  // Calculate range for pagination
  const from = 0;
  const to = limit - 1;

  const { data, error, count } = await query
    .order('item_name')
    .range(from, to);
  
  if (error) {
    console.error('Supabase error:', error);
    return { items: [], total: 0 };
  }

  const items = (data || []).map((item: any) => ({
    ...item,
    name: item.item_name || item.name || 'Unnamed Item',
    base_price: item.item_price ?? item.base_price ?? 0,
  })) as MenuItem[];

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
  
  const { items, total } = await getMenuItems(category, search, limit);
  const categories = await getCategories();

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forestGreen"></div>
      </div>
    }>
      <MenuClient 
        initialItems={items} 
        categories={categories}
        policyItem={null}
        initialCategory={category}
        initialSearch={search}
      />
    </Suspense>
  );
}
