import { motion } from 'motion/react';
import { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
}

export const CategorySelector = ({ categories, selectedId, onSelect }: CategorySelectorProps) => {
  const enabledCategories = categories.filter(cat => cat.enabled);

  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide mb-6 sm:mb-8 -mx-3 px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:px-0">
      {enabledCategories.map((category) => (
        <motion.button
          key={category.id}
          onClick={() => onSelect(category.id)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
            selectedId === category.id
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          {category.icon && <span className="mr-1.5 sm:mr-2">{category.icon}</span>}
          {category.name}
        </motion.button>
      ))}
    </div>
  );
};
