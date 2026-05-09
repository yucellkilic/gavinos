import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/ProductDetailClient';
import { MenuItem } from '@/types/menu';
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

async function getChoices(itemName: string, categoryName: string): Promise<{ name: string; price: number }[]> {
  if (!itemName || !categoryName) return [];

  try {
    // 1. Fetch legacy choices from menu_items
    const { data: legacyData, error: legacyError } = await supabase
      .from('menu_items')
      .select('choice_name, choice_price')
      .eq('item_name', itemName)
      .not('choice_name', 'is', null)
      .order('choice_price');

    if (legacyError) console.error('Supabase getChoices Legacy Error:', legacyError);

    // 2. Fetch new choices from menu_options
    // We strictly fetch options that are EITHER for this specific item OR explicitly contain this category
    let advancedData = null;
    if (itemName || categoryName) {
      let query = supabase.from('menu_options').select('name, price');
      let conditions = [];
      if (itemName) conditions.push(`item_name.eq."${itemName}"`);
      if (categoryName) conditions.push(`categories.cs.["${categoryName}"]`);
      
      const { data, error } = await query.or(conditions.join(','));
      if (error) console.error('Supabase getChoices Advanced Error:', error);
      else advancedData = data;
    }

    const choices = [
      ...(legacyData || []).map(row => ({
        name: row.choice_name || 'Unknown Option',
        price: row.choice_price || 0,
      })),
      ...(advancedData || []).map(row => ({
        name: row.name || 'Unknown Option',
        price: Number(row.price) || 0,
      })),
    ];

    // Remove duplicates based on name and sort by price
    const uniqueChoices = Array.from(new Map(choices.map(c => [c.name, c])).values());
    return uniqueChoices.sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error('Exception in getChoices:', err);
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

    return (data || []).map(row => ({
      ...row,
      name: row.item_name || 'Unnamed Item',
      base_price: row.item_price ?? 0,
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
    
    // Ensure we have a valid ID before proceeding
    if (!id) {
      notFound();
    }

    const menuItem = await getMenuItem(id);

    // Trigger Next.js 404 page gracefully if the item is missing or invalid
    if (!menuItem) {
      notFound();
    }

    const [relatedItems, choices, beverages] = await Promise.all([
      getRelatedItems(menuItem.category_name || '', menuItem.id),
      getChoices(menuItem.item_name || '', menuItem.category_name || ''),
      getBeverages(),
    ]);

    // Ensure props are never undefined by using fallback empty arrays
    return (
      <ProductDetailClient 
        menuItem={menuItem} 
        relatedItems={relatedItems || []} 
        choices={choices || []}
        beverages={menuItem.category_name === 'Beverages' ? [] : (beverages || [])}
      />
    );
  } catch (error) {
    console.error('Fatal error rendering ProductDetailPage:', error);
    notFound(); // Fallback to 404 instead of raw 500 error page
  }
}

