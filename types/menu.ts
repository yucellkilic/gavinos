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
  name?: string;
  base_price?: number | null;
  description?: string | null;
}

// New modifier system types (category-based)
export interface ModifierGroup {
  id: string;
  name: string;
  category_name: string;
  display_order: number;
  min_select: number;
  max_select: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: string;
  group_id: string;
  name: string;
  price: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Category with hierarchy
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  parent_id: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  children?: Category[];
}

// User profile
export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Order
export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: string;
  items: any;
  delivery_type: string;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  phone: string | null;
  special_instructions: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// Order item (normalized)
export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  base_price: number;
  quantity: number;
  number_of_people: number;
  selected_modifiers: any[];
  special_instructions: string | null;
  line_total: number;
  created_at: string;
}

// Favorite
export interface Favorite {
  id: string;
  user_id: string;
  menu_item_id: string;
  created_at: string;
  menu_items?: MenuItem;
}
