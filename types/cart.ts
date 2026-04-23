export interface CartItemConfiguration {
  requiredOptions: Record<string, string>;
  optionalOptions: string[];
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  base_price: number;
  numberOfPeople: number;
  quantity: number;
  configuration: CartItemConfiguration;
  totalPrice: number;
  image_url: string;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}
