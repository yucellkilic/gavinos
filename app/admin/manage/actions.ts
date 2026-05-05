'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { MenuItem } from '@/types/menu';
import { revalidatePath } from 'next/cache';

export async function updateItemPrice(id: string, newPrice: number) {
  const { error } = await supabaseAdmin
    .from('menu_items')
    .update({ base_price: newPrice })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/menu');
  revalidatePath('/admin/manage');
}

export async function addItem(item: Partial<MenuItem>) {
  const { error } = await supabaseAdmin
    .from('menu_items')
    .insert([item]);

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
