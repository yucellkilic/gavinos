'use client';

import { motion } from 'framer-motion';

interface DeliveryTypeSelectorProps {
  value: 'delivery' | 'pickup';
  onChange: (type: 'delivery' | 'pickup') => void;
}

export default function DeliveryTypeSelector({ value, onChange }: DeliveryTypeSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Delivery Type
      </label>
      <div className="relative flex bg-gray-100 rounded-lg p-1 shadow-sm">
        {/* Sliding background indicator */}
        <motion.div
          className="absolute top-1 bottom-1 bg-forestGreen rounded-md shadow-md"
          initial={false}
          animate={{
            left: value === 'delivery' ? '0.25rem' : '50%',
            right: value === 'delivery' ? '50%' : '0.25rem',
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />

        {/* Delivery Button */}
        <button
          type="button"
          onClick={() => onChange('delivery')}
          className={`
            relative z-10 flex-1 min-h-[44px] px-4 py-2 rounded-md
            font-semibold text-sm transition-smooth
            ${
              value === 'delivery'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
          aria-pressed={value === 'delivery'}
          aria-label="Select delivery option"
        >
          Delivery
        </button>

        {/* Pickup Button */}
        <button
          type="button"
          onClick={() => onChange('pickup')}
          className={`
            relative z-10 flex-1 min-h-[44px] px-4 py-2 rounded-md
            font-semibold text-sm transition-smooth
            ${
              value === 'pickup'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
          aria-pressed={value === 'pickup'}
          aria-label="Select pickup option"
        >
          Pickup
        </button>
      </div>
    </div>
  );
}
