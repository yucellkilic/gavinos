import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import MenuClient from '@/components/MenuClient';
import { MenuItem } from '@/types/menu';

export const dynamic = 'force-dynamic';

// Fetch unique categories directly from Supabase
async function getCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('category_name')
      .not('category_name', 'is', null);

    if (error) {
      console.error('Supabase getCategories Error:', JSON.stringify(error, null, 2));
      return [];
    }

    const uniqueCategories = Array.from(new Set((data || []).map((item: any) => item.category_name as string)));
    
    // Sort categories: Priority items first, Beverages last, rest alphabetical
    const priorityCategories = ['Pizza', 'Gourmet Pizza', 'Pasta Dinner', 'Entrées', 'Mediterranean Mains & Sides'];
    return uniqueCategories.sort((a, b) => {
      if (a === 'Beverages') return 1;
      if (b === 'Beverages') return -1;
      
      const aPriority = priorityCategories.findIndex(p => a.includes(p));
      const bPriority = priorityCategories.findIndex(p => b.includes(p));
      
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      
      return a.localeCompare(b);
    });
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

    // We don't range on DB because of denormalized choices (multiple rows per item_name).
    // Fetch all matching, deduplicate in JS, then paginate.
    const { data, error } = await query.order('item_name');

    if (error) {
      console.error('Supabase getMenuItems Error:', JSON.stringify(error, null, 2));
      return { items: [] as MenuItem[], total: 0 };
    }

    // Deduplicate by item_name
    const uniqueItemsMap = new Map<string, any>();
    (data || []).forEach((item: any) => {
      // If we already have the item, prefer the one where choice_name is null (main item row)
      if (uniqueItemsMap.has(item.item_name)) {
        const existing = uniqueItemsMap.get(item.item_name);
        if (existing.choice_name !== null && item.choice_name === null) {
          uniqueItemsMap.set(item.item_name, item);
        }
      } else {
        // Only include items that have a price (skip purely garnish rows with no price)
        if (item.item_price !== null && item.item_price > 0) {
           uniqueItemsMap.set(item.item_name, item);
        }
      }
    });

    const deduplicatedData = Array.from(uniqueItemsMap.values());
    const total = deduplicatedData.length;
    
    // In-memory pagination
    const paginatedData = deduplicatedData.slice(offset, offset + limit);

    // Map database column names to UI-friendly aliases
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
