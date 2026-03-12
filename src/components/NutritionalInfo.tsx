import { motion } from 'motion/react';
import { MeatOption } from '../types';

interface NutritionalInfoProps {
  meat: MeatOption;
}

export const NutritionalInfo = ({ meat }: NutritionalInfoProps) => {
  return (
    <motion.div 
      key={meat.id + '-stats'}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex justify-between lg:justify-start lg:gap-12 mb-1 lg:mb-10 bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl lg:bg-transparent lg:p-0 border border-white/5 lg:border-none"
    >
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-base sm:text-xl lg:text-3xl font-bold">{(meat.calories || 0).toFixed(1)}</span>
        <span className="text-[9px] sm:text-xs lg:text-sm text-gray-500 font-medium">Calorías</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-base sm:text-xl lg:text-3xl font-bold">{(meat.protein || 0).toFixed(1)}</span>
        <span className="text-[9px] sm:text-xs lg:text-sm text-gray-500 font-medium">Proteína</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-base sm:text-xl lg:text-3xl font-bold">{(meat.fat || 0).toFixed(1)}</span>
        <span className="text-[9px] sm:text-xs lg:text-sm text-gray-500 font-medium">Grasa</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-base sm:text-xl lg:text-3xl font-bold">{(meat.carbs || 0).toFixed(1)}</span>
        <span className="text-[9px] sm:text-xs lg:text-sm text-gray-500 font-medium">Carbos</span>
      </div>
    </motion.div>
  );
};
