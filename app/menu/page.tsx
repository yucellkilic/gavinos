import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem } from '@/types/menu';

export const revalidate = 60; // ISR: 60 seconds

async function getMenuItems(category?: string, search?: string) {
  let query = supabase
    .from('menu_items')
    .select('*')
    .eq('is_policy_object', false);

  if (category && category !== 'all') {
    // The badges logic from before: item.badges.includes(...)
    // In Supabase, badges is likely a text[] or jsonb column.
    // If it's a text array, we use .contains('badges', [categoryValue])
    // But categories in the UI have different IDs than badges.
    
    const categoryToBadge: Record<string, string> = {
      'hot-hors': "Hot Hors d'Oeuvres",
      'cold-hors': "Cold Hors d'Oeuvres",
      'stationary': "Stationary Display",
      'sit-down': "Sit-Down Entrée",
      'duet': "Duet Entrée",
      'buffet': "Buffet Package",
      'carving': "Carving Station",
    };

    const badgeValue = categoryToBadge[category];
    if (badgeValue) {
      if (badgeValue === "Sit-Down Entrée") {
        // Special case from original code: .some(b => b.includes('Sit-Down Entrée') && !b.includes('Duet'))
        query = query.ilike('badges', `%${badgeValue}%`).not('badges', 'ilike', '%Duet%');
      } else {
        query = query.ilike('badges', `%${badgeValue}%`);
      }
    }
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query.order('name');
  
  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  return data as MenuItem[];
}

async function getPolicyObject() {
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_policy_object', true)
    .single();
  
  return data as MenuItem | null;
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const category = searchParams.category || 'all';
  const search = searchParams.search || '';
  
  const [items, policyItem] = await Promise.all([
    getMenuItems(category, search),
    getPolicyObject(),
  ]);

  return (
    <MenuClient 
      initialItems={items} 
      policyItem={policyItem} 
      initialCategory={category}
      initialSearch={search}
    />
  );
}
