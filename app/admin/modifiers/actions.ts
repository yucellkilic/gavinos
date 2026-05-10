'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

// ─── Modifier Group Actions ───

export async function getCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('menu_items')
      .select('category_name')
      .not('category_name', 'is', null);

    if (error) throw new Error(error.message);
    
    const categories = [...new Set((data || []).map((r: any) => r?.category_name).filter(Boolean))];
    return categories.sort();
  } catch (err) {
    console.error('getCategories error:', err);
    return [];
  }
}

export async function getModifierGroups(categoryName?: string) {
  try {
    let query = supabaseAdmin
      .from('modifier_groups')
      .select('*')
      .order('display_order');

    if (categoryName) {
      query = query.eq('category_name', categoryName);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  } catch (err) {
    console.error('getModifierGroups error:', err);
    return [];
  }
}

export async function createModifierGroup(group: {
  name: string;
  category_name: string;
  min_select?: number;
  max_select?: number;
}) {
  const { error } = await supabaseAdmin
    .from('modifier_groups')
    .insert({
      name: group.name,
      category_name: group.category_name,
      min_select: group.min_select ?? 0,
      max_select: group.max_select ?? 10,
    });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/modifiers');
}

export async function updateModifierGroup(id: string, updates: {
  name?: string;
  category_name?: string;
  min_select?: number;
  max_select?: number;
  is_active?: boolean;
}) {
  const { error } = await supabaseAdmin
    .from('modifier_groups')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/modifiers');
}

export async function deleteModifierGroup(id: string) {
  // CASCADE will delete child modifiers
  const { error } = await supabaseAdmin
    .from('modifier_groups')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/modifiers');
}

// ─── Modifier (Topping) Actions ───

export async function getModifiers(groupId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('modifiers')
      .select('*')
      .eq('group_id', groupId)
      .order('display_order');

    if (error) throw new Error(error.message);
    return data || [];
  } catch (err) {
    console.error('getModifiers error:', err);
    return [];
  }
}

export async function createModifier(modifier: {
  group_id: string;
  name: string;
  price: number;
}) {
  const { error } = await supabaseAdmin
    .from('modifiers')
    .insert({
      group_id: modifier.group_id,
      name: modifier.name,
      price: modifier.price || 0,
    });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/modifiers');
}

export async function updateModifier(id: string, updates: {
  name?: string;
  price?: number;
  is_active?: boolean;
  display_order?: number;
}) {
  const { error } = await supabaseAdmin
    .from('modifiers')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/modifiers');
}

export async function deleteModifier(id: string) {
  const { error } = await supabaseAdmin
    .from('modifiers')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/modifiers');
}
