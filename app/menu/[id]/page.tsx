import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/ProductDetailClient';
import { MenuItem } from '@/types/menu';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getMenuItem(id: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    name: data.item_name || 'Unnamed Item',
    base_price: data.item_price ?? 0,
  } as MenuItem;
}

// Fetch related items from the same category
async function getRelatedItems(categoryName: string, excludeId: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category_name', categoryName)
    .neq('id', excludeId)
    .limit(6);

  if (error || !data) return [];

  return data.map((item: any) => ({
    ...item,
    name: item.item_name || 'Unnamed Item',
    base_price: item.item_price ?? 0,
  })) as MenuItem[];
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
