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
  totalPrice: number | null;
  image_url: string;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number | null;
}
