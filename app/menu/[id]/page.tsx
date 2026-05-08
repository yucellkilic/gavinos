import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/ProductDetailClient';
import { MenuItem } from '@/types/menu';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getMenuItem(id: string): Promise<MenuItem | null> {
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
    
    if (!data) return [];

    return data.map((item: any) => ({
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
    // We fetch options that are EITHER for this specific item OR for this entire category
    const { data: advancedData, error: advancedError } = await supabase
      .from('menu_options')
      .select('name, price')
      .or(`item_name.eq."${itemName}",and(category_name.eq."${categoryName}",item_name.is.null)`);

    if (advancedError) console.error('Supabase getChoices Advanced Error:', advancedError);

    const choices = [
      ...(legacyData || []).map(row => ({
        name: row.choice_name,
        price: row.choice_price || 0,
      })),
      ...(advancedData || []).map(row => ({
        name: row.name,
        price: Number(row.price) || 0,
      })),
    ];

    // Remove duplicates based on name
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
  const { id } = await params;
  const menuItem = await getMenuItem(id);

  if (!menuItem) {
    notFound();
  }

  const [relatedItems, choices, beverages] = await Promise.all([
    getRelatedItems(menuItem.category_name || '', menuItem.id),
    getChoices(menuItem.item_name || '', menuItem.category_name || ''),
    getBeverages(),
  ]);

  return (
    <ProductDetailClient 
      menuItem={menuItem} 
      relatedItems={relatedItems} 
      choices={choices}
      beverages={beverages}
    />
  );
}

