import { useState, useEffect } from 'react';
import { calculatePrice, PriceCalculation } from '@/lib/priceCalculator';

interface PricedItem {
  id: string;
  price?: number | null;
}

export function usePriceCalculator(
  basePrice: number | null,
  initialPeople: number = 1,
  initialQuantity: number = 1
) {
  const [numberOfPeople, setNumberOfPeople] = useState(initialPeople);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedOptionalOptions, setSelectedOptionalOptions] = useState<PricedItem[]>([]);
  const [selectedAccompaniments, setSelectedAccompaniments] = useState<PricedItem[]>([]);
  const [calculation, setCalculation] = useState<PriceCalculation>(() =>
    calculatePrice(basePrice, initialPeople, initialQuantity, [], [])
  );

  useEffect(() => {
    const newCalculation = calculatePrice(
      basePrice,
      numberOfPeople,
      quantity,
      selectedOptionalOptions,
      selectedAccompaniments
    );
    setCalculation(newCalculation);
  }, [basePrice, numberOfPeople, quantity, selectedOptionalOptions, selectedAccompaniments]);

  const toggleOptionalOption = (option: PricedItem) => {
    setSelectedOptionalOptions((prev) => {
      const exists = prev.find((opt) => opt.id === option.id);
      if (exists) {
        return prev.filter((opt) => opt.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const toggleAccompaniment = (item: PricedItem) => {
    setSelectedAccompaniments((prev) => {
      const exists = prev.find((acc) => acc.id === item.id);
      if (exists) {
        return prev.filter((acc) => acc.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isAccompanimentSelected = (itemId: string): boolean => {
    return selectedAccompaniments.some((acc) => acc.id === itemId);
  };

  return {
    numberOfPeople,
    setNumberOfPeople,
    quantity,
    setQuantity,
    selectedOptionalOptions,
    toggleOptionalOption,
    selectedAccompaniments,
    toggleAccompaniment,
    isAccompanimentSelected,
    calculation,
  };
}
