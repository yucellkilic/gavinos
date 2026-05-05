import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { MenuItem } from '@/types/menu';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: menuItem, error } = await supabase
    .from('menu_items')
    .select('id, item_name, item_price, description, image_url')
    .eq('id', params.id)
    .single();

  if (error || !menuItem) {
    return {
      title: 'Item Not Found - GAVINO\'S PIZZA',
      description: 'The requested menu item could not be found.',
    };
  }

  const item = {
    ...menuItem,
    name: menuItem.item_name,
    base_price: menuItem.item_price,
  } as MenuItem;

  return {
    title: `${item.name} - GAVINO'S PIZZA Catering`,
    description: item.description,
    openGraph: {
      title: item.name,
      description: item.description,
      images: [item.image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: item.name,
      description: item.description,
      images: [item.image_url],
    },
  };
}
