'use client';

import { motion } from 'framer-motion';
import { MealType } from '@/types/menu';

interface MenuFilterProps {
  activeFilter: MealType | 'all';
  onFilterChange: (filter: MealType | 'all') => void;
}

export default function MenuFilter({ activeFilter, onFilterChange }: MenuFilterProps) {
  const filters: { value: MealType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Items' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-12">
      {filters.map((filter) => (
        <motion.button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-3 rounded-full font-semibold transition-smooth ${
            activeFilter === filter.value
              ? 'bg-forestGreen text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
          }`}
        >
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
}
