'use client';

import { RequiredOption } from '@/types/menu';

interface RequiredOptionsProps {
  options: RequiredOption[];
  selectedOptions: Record<string, string>;
  onOptionChange: (optionId: string, choiceId: string) => void;
}

export default function RequiredOptions({
  options,
  selectedOptions,
  onOptionChange,
}: RequiredOptionsProps) {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Required Selections <span className="text-classicRed">*</span>
      </h3>

      {options.map((option) => {
        const isSelected = !!selectedOptions[option.id];
        
        return (
          <div
            key={option.id}
            className={`p-4 rounded-lg border-2 transition-smooth ${
              isSelected
                ? 'border-forestGreen bg-forestGreen/5'
                : 'border-gray-200 bg-white'
            }`}
          >
            <label className="block text-sm font-medium text-gray-900 mb-3">
              {option.name}
              {!isSelected && (
                <span className="text-classicRed text-xs ml-2">(Please select)</span>
              )}
            </label>

            <div className="space-y-2">
              {option.choices.map((choice) => (
                <label
                  key={choice.id}
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-smooth"
                >
                  <input
                    type="radio"
                    name={option.id}
                    value={choice.id}
                    checked={selectedOptions[option.id] === choice.id}
                    onChange={() => onOptionChange(option.id, choice.id)}
                    className="w-4 h-4 text-forestGreen focus:ring-forestGreen focus:ring-2"
                  />
                  <span className="ml-3 flex-1 text-sm text-gray-700">
                    {choice.label}
                  </span>
                  {choice.price > 0 && (
                    <span className="text-sm font-medium text-forestGreen">
                      +${choice.price.toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
