'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
}

/**
 * PhoneInput component with international format support
 * Supports formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, +X XXX XXX XXXX
 */
export default function PhoneInput({ value, onChange, onBlur, error }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(value);

  // Sync display value with prop value
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  /**
   * Format phone number as user types
   * Supports multiple international formats
   */
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters except +
    const cleaned = input.replace(/[^\d+]/g, '');
    
    // If starts with +, format as international
    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1);
      if (digits.length <= 1) return cleaned;
      if (digits.length <= 4) return `+${digits.slice(0, 1)} ${digits.slice(1)}`;
      if (digits.length <= 7) return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
      return `+${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
    }
    
    // Format as US number
    const digits = cleaned;
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  const handleBlur = () => {
    onBlur();
  };

  return (
    <div className="w-full">
      <label htmlFor="phone-input" className="block text-sm font-semibold text-gray-700 mb-2">
        Phone Number
      </label>
      <div className="relative">
        <input
          id="phone-input"
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="(555) 123-4567"
          className={`
            w-full min-h-[44px] px-4 py-2 rounded-lg
            border-2 transition-smooth
            font-medium text-gray-900
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-forestGreen focus:ring-opacity-50
            ${
              error
                ? 'border-classicRed focus:border-classicRed'
                : 'border-gray-300 focus:border-forestGreen'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : undefined}
        />
      </div>
      
      {/* Error Message with Animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            id="phone-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mt-2 text-classicRed text-sm"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Validation function for phone numbers
 * Accepts formats: (XXX) XXX-XXXX, XXX-XXX-XXXX, +X XXX XXX XXXX
 */
export function validatePhoneNumber(phoneNumber: string): { isValid: boolean; error?: string } {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Check minimum digit count first (at least 10 digits)
  const digitCount = phoneNumber.replace(/\D/g, '').length;
  if (digitCount < 10) {
    return { isValid: false, error: 'Phone number must contain at least 10 digits' };
  }

  // Regex pattern for multiple phone formats
  // Supports: (XXX) XXX-XXXX, XXX-XXX-XXXX, +X XXX XXX XXXX, and variations
  const phonePattern = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  
  // Remove spaces for validation
  const cleanedNumber = phoneNumber.replace(/\s/g, '');
  
  if (!phonePattern.test(cleanedNumber)) {
    return { isValid: false, error: 'Please enter a valid phone number (e.g., (555) 123-4567)' };
  }

  return { isValid: true };
}
