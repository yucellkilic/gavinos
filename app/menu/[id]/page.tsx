import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/ProductDetailClient';
import { MenuItem, ModifierGroup } from '@/types/menu';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getMenuItem(id: string): Promise<MenuItem | null> {
  // UUID format validation to prevent database query errors on invalid routes
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
    console.warn(`[getMenuItem] Invalid UUID format: ${id}`);
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase getMenuItem Error:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      name: data.item_name || 'Unnamed Item',
      base_price: data.item_price ?? 0,
    } as MenuItem;
  } catch (err) {
    console.error('Exception in getMenuItem:', err);
    return null;
  }
}

async function getRelatedItems(categoryName: string, excludeId: string): Promise<MenuItem[]> {
  if (!categoryName || !excludeId) return [];
  
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_name', categoryName)
      .neq('id', excludeId)
      .limit(6);

    if (error) {
      console.error('Supabase getRelatedItems Error:', JSON.stringify(error, null, 2));
      return [];
    }
    
    return (data || []).map((item: any) => ({
      ...item,
      name: item.item_name || 'Unnamed Item',
      base_price: item.item_price ?? 0,
    })) as MenuItem[];
  } catch (err) {
    console.error('Exception in getRelatedItems:', err);
    return [];
  }
}

/**
 * Fetch legacy choices from menu_items + menu_options (old system).
 * Used for "Add-ons" section (sides, drinks, etc.)
 */
async function getChoices(itemName: string, categoryName: string): Promise<{ name: string; price: number }[]> {
  if (!itemName && !categoryName) return [];

  try {
    const promises: any[] = [];

    // 1. Fetch legacy choices from menu_items
    if (itemName) {
      promises.push(
        supabase
          .from('menu_items')
          .select('choice_name, choice_price')
          .eq('item_name', itemName)
          .not('choice_name', 'is', null)
          .order('choice_price')
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    // 2. Fetch from menu_options by item_name
    if (itemName) {
      promises.push(
        supabase
          .from('menu_options')
          .select('name, price')
          .eq('item_name', itemName)
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    // 3. Fetch from menu_options by category
    if (categoryName) {
      promises.push(
        supabase
          .from('menu_options')
          .select('name, price')
          .contains('categories', [categoryName])
      );
    } else {
      promises.push(Promise.resolve({ data: [], error: null }));
    }

    const [legacyRes, itemRes, categoryRes] = await Promise.all(promises);

    const choices = [
      ...(legacyRes?.data || []).map((row: any) => ({
        name: row?.choice_name || 'Unknown Option',
        price: Number(row?.choice_price) || 0,
      })),
      ...(itemRes?.data || []).map((row: any) => ({
        name: row?.name || 'Unknown Option',
        price: Number(row?.price) || 0,
      })),
      ...(categoryRes?.data || []).map((row: any) => ({
        name: row?.name || 'Unknown Option',
        price: Number(row?.price) || 0,
      })),
    ];

    // Safe duplicate removal and sorting
    const uniqueChoices = Array.from(new Map(choices.map(c => [c.name, c])).values());
    return uniqueChoices.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error('Exception in getChoices:', err);
    return [];
  }
}

/**
 * Fetch new modifier groups + modifiers for a category.
 * This is the new topping system (category-based).
 */
async function getModifierGroups(categoryName: string): Promise<ModifierGroup[]> {
  if (!categoryName) return [];

  try {
    const { data: groups, error: groupsError } = await supabase
      .from('modifier_groups')
      .select('*')
      .eq('category_name', categoryName)
      .eq('is_active', true)
      .order('display_order');

    if (groupsError || !groups || groups.length === 0) {
      if (groupsError) console.error('Supabase getModifierGroups Error:', groupsError);
      return [];
    }

    // Fetch all modifiers for these groups in one query
    const groupIds = groups.map((g: any) => g.id);
    const { data: modifiers, error: modError } = await supabase
      .from('modifiers')
      .select('*')
      .in('group_id', groupIds)
      .eq('is_active', true)
      .order('display_order');

    if (modError) {
      console.error('Supabase getModifiers Error:', modError);
    }

    // Attach modifiers to their groups
    return groups.map((group: any) => ({
      ...group,
      modifiers: (modifiers || []).filter((m: any) => m?.group_id === group.id),
    })) as ModifierGroup[];
  } catch (err) {
    console.error('Exception in getModifierGroups:', err);
    return [];
  }
}

async function getBeverages(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_name', 'Beverages')
      .is('choice_name', null) // Only main beverages
      .limit(4);

    if (error) {
      console.error('Supabase getBeverages Error:', JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []).map((row: any) => ({
      ...row,
      name: row?.item_name || 'Unnamed Item',
      base_price: row?.item_price ?? 0,
    })) as MenuItem[];
  } catch (err) {
    console.error('Exception in getBeverages:', err);
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const { id } = await params;
    
    // Ensure we have a valid ID and cast to string explicitly
    const safeId = id ? String(id) : '';
    if (!safeId) {
      notFound();
    }

    const menuItem = await getMenuItem(safeId);

    // Trigger Next.js 404 page gracefully if the item is missing or invalid
    if (!menuItem) {
      notFound();
    }

    const categoryName = menuItem.category_name || '';
    const itemName = menuItem.item_name || '';

    const [relatedItems, choices, modifierGroups, beverages] = await Promise.all([
      getRelatedItems(categoryName, menuItem.id),
      getChoices(itemName, categoryName),
      getModifierGroups(categoryName),
      getBeverages(),
    ]);

    return (
      <ProductDetailClient 
        menuItem={menuItem} 
        relatedItems={relatedItems || []} 
        choices={choices || []}
        modifierGroups={modifierGroups || []}
        beverages={categoryName === 'Beverages' ? [] : (beverages || [])}
      />
    );
  } catch (error) {
    console.error('Fatal error rendering ProductDetailPage:', error);
    notFound(); // Fallback to 404 instead of raw 500 error page
  }
}
