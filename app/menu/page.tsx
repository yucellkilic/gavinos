import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem, Category } from '@/types/menu';

export const dynamic = 'force-dynamic';

// Fetch categories from the new categories table
async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Supabase getCategories Error:', JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []) as Category[];
  } catch (err) {
    console.error('Exception in getCategories:', err);
    return [];
  }
}

async function getMenuItems(category?: string, search?: string, offset = 0, limit = 50) {
  try {
    let query = supabase.from('menu_items').select('*').limit(3000);

    if (category && category !== 'all') {
      query = query.eq('category_name', category);
    }

    if (search) {
      query = query.ilike('item_name', `%${search}%`);
    }

    const { data, error } = await query.order('item_name');

    if (error) {
      console.error('Supabase getMenuItems Error:', JSON.stringify(error, null, 2));
      return { items: [] as MenuItem[], total: 0 };
    }

    // Deduplicate by item_name
    const uniqueItemsMap = new Map<string, any>();
    (data || []).forEach((item: any) => {
      if (uniqueItemsMap.has(item.item_name)) {
        const existing = uniqueItemsMap.get(item.item_name);
        if (existing.choice_name !== null && item.choice_name === null) {
          uniqueItemsMap.set(item.item_name, item);
        }
      } else {
        if (item.item_price !== null && item.item_price > 0) {
          uniqueItemsMap.set(item.item_name, item);
        }
      }
    });

    const deduplicatedData = Array.from(uniqueItemsMap.values());

    // Custom sort for "All" view
    if (!category || category === 'all') {
      deduplicatedData.sort((a, b) => {
        if (a.category_name === 'Beverages' && b.category_name !== 'Beverages') return 1;
        if (a.category_name !== 'Beverages' && b.category_name === 'Beverages') return -1;

        const priorityCategories = ['Pizza', 'Pasta', 'Entrées', 'Mediterranean'];
        const aPri = priorityCategories.findIndex(p => a.category_name?.includes(p));
        const bPri = priorityCategories.findIndex(p => b.category_name?.includes(p));

        if (aPri !== -1 && bPri !== -1) return aPri - bPri;
        if (aPri !== -1) return -1;
        if (bPri !== -1) return 1;

        return a.item_name.localeCompare(b.item_name);
      });
    }

    const total = deduplicatedData.length;
    const paginatedData = deduplicatedData.slice(offset, offset + limit);

    const items: MenuItem[] = paginatedData.map((item: any) => ({
      ...item,
      name: item.item_name || 'Unnamed Item',
      base_price: item.item_price ?? 0,
    }));

    return { items, total };
  } catch (err) {
    console.error('Exception in getMenuItems:', err);
    return { items: [] as MenuItem[], total: 0 };
  }
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; offset?: string; limit?: string }>;
}) {
  const resolvedParams = await searchParams;
  const category = resolvedParams.category || 'all';
  const search = resolvedParams.search || '';
  const offset = parseInt(resolvedParams.offset || '0');
  const limit = parseInt(resolvedParams.limit || '50');

  const [{ items, total }, categories] = await Promise.all([
    getMenuItems(category, search, offset, limit),
    getCategories(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="ez-spinner" style={{ width: 40, height: 40 }} />
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
