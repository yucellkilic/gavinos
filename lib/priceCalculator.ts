import { OptionalOption, AccompanimentItem } from '@/types/menu';

export interface PriceCalculation {
  basePrice: number;
  optionalOptionsPrice: number;
  accompanimentsPrice: number;
  subtotal: number;
  total: number;
}

export function calculatePrice(
  basePrice: number,
  numberOfPeople: number,
  quantity: number,
  selectedOptionalOptions: OptionalOption[] = [],
  selectedAccompaniments: AccompanimentItem[] = []
): PriceCalculation {
  const optionalOptionsPrice = selectedOptionalOptions.reduce(
    (sum, option) => sum + option.price,
    0
  );

  const accompanimentsPrice = selectedAccompaniments.reduce(
    (sum, acc) => sum + acc.price,
    0
  );

  const subtotal = (basePrice + optionalOptionsPrice + accompanimentsPrice) * numberOfPeople;
  const total = subtotal * quantity;

  return {
    basePrice,
    optionalOptionsPrice,
    accompanimentsPrice,
    subtotal,
    total,
  };
}

export function formatPrice(price: number): string {
  return price.toFixed(2);
}

export function formatCurrency(price: number): string {
  return `$${formatPrice(price)}`;
}
