import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem } from '@/types/menu';

export const revalidate = 60;

async function getMenuItems(category?: string, search?: string, limit = 50) {
  let query = supabase.from('menu_items').select('*');

  if (category && category !== 'all') {
    // Map URL category to database category_name
    const categoryMap: Record<string, string> = {
      'hot-hors': "Hot Hors d'Oeuvres",
      'cold-hors': "Cold Hors d'Oeuvres",
      'stationary': "Stationary Display",
      'sit-down': "Sit-Down Entrée",
      'duet': "Duet Entrée",
      'buffet': "Buffet Package",
      'carving': "Carving Station",
    };

    const mappedCategory = categoryMap[category];
    if (mappedCategory) {
      query = query.or(`category_name.ilike.%${mappedCategory}%,badges.ilike.%${mappedCategory}%`);
    }
  }

  if (search) {
    query = query.ilike('item_name', `%${search}%`);
  }

  const { data, error } = await query
    .order('item_name')
    .limit(limit);
  
  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item,
    name: item.item_name || item.name || 'Unnamed Item',
    base_price: item.item_price ?? item.base_price ?? 0,
  })) as MenuItem[];
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; limit?: string };
}) {
  const category = searchParams.category || 'all';
  const search = searchParams.search || '';
  const limit = parseInt(searchParams.limit || '50');
  
  const items = await getMenuItems(category, search, limit);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forestGreen"></div>
      </div>
    }>
      <MenuClient 
        initialItems={items} 
        policyItem={null} // Temporarily null until is_policy_object logic is clarified
        initialCategory={category}
        initialSearch={search}
      />
    </Suspense>
  );
}
