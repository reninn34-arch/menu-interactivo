import { motion } from 'motion/react';
import { BurgerComponentProps } from '../../types';

export const Cheese = ({ isCollapsed }: BurgerComponentProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ 
      y: isCollapsed ? 0 : 0,
      opacity: 1,
    }} 
    transition={{ delay: 0.15, type: 'tween', duration: 0.2, ease: 'easeOut' }}
    className="relative z-40"
    style={{ willChange: 'transform, opacity' }}
  >
    <div className={`w-52 h-3 bg-gradient-to-b from-[#FFD700] to-[#FF8C00] rounded-sm transform rotate-2 relative ${
      isCollapsed ? '' : 'shadow-[0_15px_20px_rgba(0,0,0,0.5)]'
    }`}>
      <div className="absolute -bottom-6 right-6 w-8 h-10 bg-gradient-to-b from-[#FF8C00] to-[#E67E22] rounded-b-full transform -rotate-12 shadow-lg" />
      <div className="absolute -bottom-4 left-8 w-6 h-8 bg-gradient-to-b from-[#FF8C00] to-[#E67E22] rounded-b-full transform rotate-12 shadow-lg" />
    </div>
  </motion.div>
);
