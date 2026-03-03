import { motion } from 'motion/react';
import { BurgerComponentProps } from '../../types';

export const TopBun = ({ isCollapsed }: BurgerComponentProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ 
      y: isCollapsed ? 0 : 0, 
      opacity: 1,
    }} 
    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
    className="relative z-50"
  >
    <div className="w-56 h-24 bg-gradient-to-b from-[#E5A952] via-[#D48A30] to-[#A66018] rounded-t-[100px] rounded-b-[12px] shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),inset_0_5px_15px_rgba(255,255,255,0.5),0_20px_25px_rgba(0,0,0,0.6)] relative overflow-hidden">
      {/* Seeds */}
      <div className="absolute top-6 left-12 w-2 h-3 bg-[#FFF3E0] rounded-full rotate-45 shadow-sm opacity-90" />
      <div className="absolute top-8 left-24 w-2 h-3 bg-[#FFF3E0] rounded-full -rotate-12 shadow-sm opacity-90" />
      <div className="absolute top-5 left-36 w-2 h-3 bg-[#FFF3E0] rounded-full rotate-12 shadow-sm opacity-90" />
      <div className="absolute top-12 left-16 w-2 h-3 bg-[#FFF3E0] rounded-full rotate-45 shadow-sm opacity-90" />
      <div className="absolute top-14 left-32 w-2 h-3 bg-[#FFF3E0] rounded-full -rotate-45 shadow-sm opacity-90" />
      <div className="absolute top-10 left-44 w-2 h-3 bg-[#FFF3E0] rounded-full rotate-90 shadow-sm opacity-90" />
      <div className="absolute top-16 left-24 w-2 h-3 bg-[#FFF3E0] rounded-full rotate-12 shadow-sm opacity-90" />
      <div className="absolute top-15 left-40 w-2 h-3 bg-[#FFF3E0] rounded-full -rotate-12 shadow-sm opacity-90" />
    </div>
  </motion.div>
);
