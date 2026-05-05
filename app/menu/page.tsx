import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem } from '@/types/menu';

export const revalidate = 60;

async function getMenuItems(category?: string, search?: string) {
  // Using explicit columns based on user hint: id, category_name, item_name, item_price, description, image_url
  let query = supabase
    .from('menu_items')
    .select('*');

  if (category && category !== 'all') {
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
    console.log(`Filtre uygulanıyor - Kategori: ${category}, Aranacak Değer: ${badgeValue}`);
    if (badgeValue) {
      // Try to match either in category_name or badges for maximum compatibility
      query = query.or(`category_name.ilike.%${badgeValue}%,badges.ilike.%${badgeValue}%`);
    }
  }

  if (search) {
    query = query.ilike('item_name', `%${search}%`);
  }

  const { data, error } = await query.order('item_name');
  
  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  console.log('Supabase Veri Sayısı:', data?.length || 0);
  if (data && data.length > 0) {
    console.log('İlk ürün örneği:', data[0]);
    const categories = Array.from(new Set(data.map((i: any) => i.category_name || i.badges)));
    console.log('Mevcut Kategoriler (ilk 5):', categories.slice(0, 5));
  }

  // Map database names to application names (MenuItem type)
  return (data || []).map((item: any) => ({
    ...item,
    name: item.item_name || item.name || 'Unnamed Item',
    base_price: item.item_price ?? item.base_price ?? 0,
  })) as MenuItem[];
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const category = searchParams.category || 'all';
  const search = searchParams.search || '';
  
  const items = await getMenuItems(category, search);

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
