'use client';

import { OptionalOption } from '@/types/menu';

interface OptionalOptionsProps {
  options: OptionalOption[];
  selectedOptions: string[];
  onOptionToggle: (option: OptionalOption) => void;
}

export default function OptionalOptions({
  options,
  selectedOptions,
  onOptionToggle,
}: OptionalOptionsProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Optional Add-ons
      </h3>

      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);

          return (
            <label
              key={option.id}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-smooth ${
                isSelected
                  ? 'border-forestGreen bg-forestGreen/5'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onOptionToggle(option)}
                className="w-4 h-4 text-forestGreen focus:ring-forestGreen focus:ring-2 rounded"
              />
              <span className="ml-3 flex-1 text-sm text-gray-700">
                {option.label}
              </span>
              <span className="text-sm font-medium text-forestGreen">
                +${option.price.toFixed(2)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
