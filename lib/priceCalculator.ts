import { OptionalOption, AccompanimentItem } from '@/types/menu';

export interface PriceCalculation {
  basePrice: number | null;
  optionalOptionsPrice: number;
  accompanimentsPrice: number;
  subtotal: number | null;
  total: number | null;
}

export function calculatePrice(
  basePrice: number | null,
  numberOfPeople: number,
  quantity: number,
  selectedOptionalOptions: OptionalOption[] = [],
  selectedAccompaniments: AccompanimentItem[] = []
): PriceCalculation {
  const optionalOptionsPrice = selectedOptionalOptions.reduce(
    (sum, option) => sum + (option.price || 0),
    0
  );

  const accompanimentsPrice = selectedAccompaniments.reduce(
    (sum, acc) => sum + (acc.price || 0),
    0
  );

  let subtotal: number | null = null;
  let total: number | null = null;

  if (basePrice !== null) {
    subtotal = (basePrice + optionalOptionsPrice + accompanimentsPrice) * numberOfPeople;
    total = subtotal * quantity;
  } else if (optionalOptionsPrice > 0 || accompanimentsPrice > 0) {
    // If base price is null (market price) but there are priced add-ons
    subtotal = (optionalOptionsPrice + accompanimentsPrice) * numberOfPeople;
    total = subtotal * quantity;
  }

  return {
    basePrice,
    optionalOptionsPrice,
    accompanimentsPrice,
    subtotal,
    total,
  };
}

export function formatPrice(price: number | null): string {
  if (price === null || price === 0) return 'Market Price';
  return price.toFixed(2);
}

export function formatCurrency(price: number | null): string {
  if (price === null || price === 0) return 'Market Price';
  return `$${price.toFixed(2)}`;
}
