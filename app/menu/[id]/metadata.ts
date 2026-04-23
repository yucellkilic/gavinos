import { Metadata } from 'next';
import menuData from '@/data/menu.json';
import { MenuItem } from '@/types/menu';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const menuItem = (menuData as MenuItem[]).find((item) => item.id === params.id);

  if (!menuItem) {
    return {
      title: 'Item Not Found - GAVINO\'S PIZZA',
      description: 'The requested menu item could not be found.',
    };
  }

  return {
    title: `${menuItem.name} - GAVINO'S PIZZA Catering`,
    description: menuItem.description,
    openGraph: {
      title: menuItem.name,
      description: menuItem.description,
      images: [menuItem.image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: menuItem.name,
      description: menuItem.description,
      images: [menuItem.image_url],
    },
  };
}
