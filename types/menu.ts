export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface RequiredOption {
  id: string;
  name: string;
  choices: {
    id: string;
    label: string;
    price: number;
  }[];
}

export interface OptionalOption {
  id: string;
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  base_price: number;
  meal_type: MealType[];
  image_url: string;
  required_options?: RequiredOption[];
  optional_options?: OptionalOption[];
  badges?: string[];
  serves?: number;
}
