export interface SelectedModifier {
  group_name: string;
  modifier_name: string;
  price: number;
}

export interface CartItemConfiguration {
  requiredOptions: Record<string, string>;
  optionalOptions: string[];
  selectedAccompaniments?: any[];
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  base_price: number | null;
  numberOfPeople: number;
  quantity: number;
  configuration: CartItemConfiguration;
  selected_modifiers: SelectedModifier[];
  totalPrice: number | null;
  image_url: string;
  category_name?: string;
  special_instructions?: string;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number | null;
}
