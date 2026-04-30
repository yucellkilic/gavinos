'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required: boolean;
}

export default function AddressInput({ value, onChange, onBlur, error, required }: AddressInputProps) {
  return (
    <AnimatePresence>
      {required && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full overflow-hidden"
        >
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            Delivery Address <span className="text-classicRed">*</span>
          </label>
          <textarea
            id="address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Enter your full delivery address"
            rows={3}
            className={`
              w-full min-h-[88px] px-4 py-3 rounded-lg border-2 
              transition-smooth text-base resize-none
              ${error 
                ? 'border-classicRed focus:border-classicRed focus:ring-classicRed/20' 
                : 'border-gray-300 focus:border-forestGreen focus:ring-forestGreen/20'
              }
              focus:outline-none focus:ring-4
            `}
          />
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 mt-2 text-classicRed text-sm"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
