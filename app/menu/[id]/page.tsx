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

async function getChoices(itemName: string): Promise<{ name: string; price: number }[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('choice_name, choice_price')
      .eq('item_name', itemName)
      .not('choice_name', 'is', null)
      .order('choice_price');

    if (error) {
      console.error('Supabase getChoices Error:', JSON.stringify(error, null, 2));
      return [];
    }

    return (data || []).map(row => ({
      name: row.choice_name,
      price: row.choice_price || 0,
    }));
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
    getChoices(menuItem.item_name || ''),
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

