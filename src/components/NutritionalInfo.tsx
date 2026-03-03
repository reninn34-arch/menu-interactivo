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
      className="flex justify-between lg:justify-start lg:gap-12 mb-6 sm:mb-8 lg:mb-10 bg-white/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl lg:bg-transparent lg:p-0 border border-white/5 lg:border-none"
    >
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{meat.calories.toFixed(1)}</span>
        <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">Calorías</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{meat.protein.toFixed(1)}</span>
        <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">Proteína</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{meat.fat.toFixed(1)}</span>
        <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">Grasa</span>
      </div>
      <div className="flex flex-col items-center lg:items-start">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{meat.carbs.toFixed(1)}</span>
        <span className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">Carbos</span>
      </div>
    </motion.div>
  );
};
