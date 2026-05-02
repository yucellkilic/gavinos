import { useState, useEffect } from 'react';
import { OptionalOption, AccompanimentItem } from '@/types/menu';
import { calculatePrice, PriceCalculation } from '@/lib/priceCalculator';

export function usePriceCalculator(
  basePrice: number | null,
  initialPeople: number = 1,
  initialQuantity: number = 1
) {
  const [numberOfPeople, setNumberOfPeople] = useState(initialPeople);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedOptionalOptions, setSelectedOptionalOptions] = useState<OptionalOption[]>([]);
  const [selectedAccompaniments, setSelectedAccompaniments] = useState<AccompanimentItem[]>([]);
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

  const toggleOptionalOption = (option: OptionalOption) => {
    setSelectedOptionalOptions((prev) => {
      const exists = prev.find((opt) => opt.id === option.id);
      if (exists) {
        return prev.filter((opt) => opt.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const toggleAccompaniment = (item: AccompanimentItem) => {
    setSelectedAccompaniments((prev) => {
      const exists = prev.find((acc) => acc.id === item.id);
      if (exists) {
        return prev.filter((acc) => acc.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isOptionalOptionSelected = (optionId: string): boolean => {
    return selectedOptionalOptions.some((opt) => opt.id === optionId);
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
    isOptionalOptionSelected,
    selectedAccompaniments,
    toggleAccompaniment,
    isAccompanimentSelected,
    calculation,
  };
}
