import { useState, useEffect } from 'react';
import { OptionalOption } from '@/types/menu';
import { calculatePrice, PriceCalculation } from '@/lib/priceCalculator';

export function usePriceCalculator(
  basePrice: number,
  initialPeople: number = 1,
  initialQuantity: number = 1
) {
  const [numberOfPeople, setNumberOfPeople] = useState(initialPeople);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedOptionalOptions, setSelectedOptionalOptions] = useState<OptionalOption[]>([]);
  const [calculation, setCalculation] = useState<PriceCalculation>(() =>
    calculatePrice(basePrice, initialPeople, initialQuantity, [])
  );

  useEffect(() => {
    const newCalculation = calculatePrice(
      basePrice,
      numberOfPeople,
      quantity,
      selectedOptionalOptions
    );
    setCalculation(newCalculation);
  }, [basePrice, numberOfPeople, quantity, selectedOptionalOptions]);

  const toggleOptionalOption = (option: OptionalOption) => {
    setSelectedOptionalOptions((prev) => {
      const exists = prev.find((opt) => opt.id === option.id);
      if (exists) {
        return prev.filter((opt) => opt.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const isOptionalOptionSelected = (optionId: string): boolean => {
    return selectedOptionalOptions.some((opt) => opt.id === optionId);
  };

  return {
    numberOfPeople,
    setNumberOfPeople,
    quantity,
    setQuantity,
    selectedOptionalOptions,
    toggleOptionalOption,
    isOptionalOptionSelected,
    calculation,
  };
}
