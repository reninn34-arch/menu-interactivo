import { motion } from 'motion/react';
import { Category } from '../types';
import { useMenu } from '../contexts/MenuContext';

interface CategorySelectorProps {
  categories: Category[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
}

export const CategorySelector = ({ categories, selectedId, onSelect }: CategorySelectorProps) => {
  const { siteConfig } = useMenu();
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
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium text-xs sm:text-sm whitespace-nowrap transition-all"
          style={{
            background: selectedId === category.id
              ? `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`
              : 'rgba(255,255,255,0.05)',
            color: selectedId === category.id ? '#FFF' : '#9CA3AF',
            boxShadow: selectedId === category.id 
              ? `0 10px 25px -5px ${siteConfig.primaryColor || '#FF9F0A'}4D`
              : 'none',
            border: selectedId === category.id ? 'none' : '1px solid rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            if (selectedId !== category.id) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedId !== category.id) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
        >
          {category.icon && <span className="mr-1.5 sm:mr-2">{category.icon}</span>}
          {category.name}
        </motion.button>
      ))}
    </div>
  );
};
