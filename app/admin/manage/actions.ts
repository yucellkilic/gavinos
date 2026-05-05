'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { MenuItem } from '@/types/menu';
import { revalidatePath } from 'next/cache';

export async function updateItemPrice(id: string, newPrice: number) {
  const { error } = await supabaseAdmin
    .from('menu_items')
    .update({ item_price: newPrice })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/menu');
  revalidatePath('/admin/manage');
}

export async function addItem(item: Partial<MenuItem>) {
  const dbItem = {
    ...item,
    item_name: item.name,
    item_price: item.base_price,
  };
  delete (dbItem as any).name;
  delete (dbItem as any).base_price;

  const { error } = await supabaseAdmin
    .from('menu_items')
    .insert([dbItem]);

  if (error) throw new Error(error.message);
  revalidatePath('/menu');
  revalidatePath('/admin/manage');
}

export async function deleteItem(id: string) {
  const { error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/menu');
  revalidatePath('/admin/manage');
}
