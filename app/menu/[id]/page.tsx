import { supabase } from '@/lib/supabase';
import ProductDetailClient from '@/components/ProductDetailClient';
import { MenuItem } from '@/types/menu';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getMenuItem(id: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, item_name, item_price, description, image_url, badges, serves, pricing_type, required_options, optional_options, accompaniment_groups')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    ...data,
    name: data.item_name,
    base_price: data.item_price,
  } as MenuItem;
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

  return <ProductDetailClient menuItem={menuItem} />;
}
