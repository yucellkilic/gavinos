// MenuItem interface aligned with Supabase menu_items table schema
// Columns: id (uuid), category_name (text), item_name (text), item_price (numeric),
// choice_name (text), choice_price (numeric), is_active (boolean), created_at (timestamptz),
// item_price2 (numeric), item_price3 (numeric), choice_price2 (numeric), choice_price3 (numeric)

export interface MenuItem {
  id: string;
  category_name: string | null;
  item_name: string | null;
  item_price: number | null;
  choice_name: string | null;
  choice_price: number | null;
  is_active: boolean | null;
  created_at: string | null;
  item_price2: number | null;
  item_price3: number | null;
  choice_price2: number | null;
  choice_price3: number | null;
  // Mapped fields for UI compatibility
  name?: string;
  base_price?: number | null;
}
