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
      console.error('Supabase getMenuItem Error:', error);
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
      console.error('Supabase getRelatedItems Error:', error);
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

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const menuItem = await getMenuItem(params.id);

  if (!menuItem) {
    notFound();
  }

  const relatedItems = await getRelatedItems(
    menuItem.category_name || '',
    menuItem.id
  );

  return <ProductDetailClient menuItem={menuItem} relatedItems={relatedItems} />;
}
