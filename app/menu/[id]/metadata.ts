import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: menuItem, error } = await supabase
    .from('menu_items')
    .select('id, item_name, category_name')
    .eq('id', params.id)
    .single();

  if (error || !menuItem) {
    return {
      title: 'Item Not Found - GAVINO\'S PIZZA',
      description: 'The requested menu item could not be found.',
    };
  }

  const itemName = menuItem.item_name || 'Menu Item';
  const categoryName = menuItem.category_name || 'Menu';

  return {
    title: `${itemName} - GAVINO'S PIZZA Catering`,
    description: `${itemName} from our ${categoryName} menu. Order online from GAVINO'S PIZZA.`,
    openGraph: {
      title: `${itemName} - GAVINO'S PIZZA`,
      description: `${itemName} from our ${categoryName} menu.`,
      type: 'website',
    },
  };
}
