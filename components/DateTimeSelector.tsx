'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { generateTimeSlots, formatTime12Hour } from '@/lib/operatingHours';

interface DateTimeSelectorProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateError?: string;
  timeError?: string;
}

export default function DateTimeSelector({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
}: DateTimeSelectorProps) {
  const timeSlots = generateTimeSlots();
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const today = new Date(Date.now() - tzOffset).toISOString().split('T')[0];

  return (
    <div className="w-full space-y-4">
      {/* Date Input */}
      <div>
        <label htmlFor="delivery-date" className="block text-sm font-semibold text-gray-700 mb-2">
          Delivery Date <span className="text-classicRed">*</span>
        </label>
        <input
          id="delivery-date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={today}
          className={`
            w-full min-h-[44px] px-4 py-2 rounded-lg border-2 
            transition-smooth text-base
            ${dateError 
              ? 'border-classicRed focus:border-classicRed focus:ring-classicRed/20' 
              : 'border-gray-300 focus:border-forestGreen focus:ring-forestGreen/20'
            }
            focus:outline-none focus:ring-4
          `}
        />
        <AnimatePresence>
          {dateError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mt-2 text-classicRed text-sm"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{dateError}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Time Input */}
      <div>
        <label htmlFor="delivery-time" className="block text-sm font-semibold text-gray-700 mb-2">
          Delivery Time <span className="text-classicRed">*</span>
        </label>
        <select
          id="delivery-time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className={`
            w-full min-h-[44px] px-4 py-2 rounded-lg border-2 
            transition-smooth text-base
            ${timeError 
              ? 'border-classicRed focus:border-classicRed focus:ring-classicRed/20' 
              : 'border-gray-300 focus:border-forestGreen focus:ring-forestGreen/20'
            }
            focus:outline-none focus:ring-4
          `}
        >
          <option value="">Select a time</option>
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {formatTime12Hour(slot)}
            </option>
          ))}
        </select>
        <AnimatePresence>
          {timeError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mt-2 text-classicRed text-sm"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{timeError}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-xs text-gray-500 mt-2">
          Operating hours: 11:00 AM - 9:00 PM
        </p>
      </div>
    </div>
  );
}
