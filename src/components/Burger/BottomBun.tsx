import { motion } from 'motion/react';
import { BurgerComponentProps } from '../../types';

export const BottomBun = ({ isCollapsed }: BurgerComponentProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ 
      y: isCollapsed ? 0 : 0,
      opacity: 1,
    }} 
    transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 20 }}
    className="relative z-0"
  >
    <div className="w-52 h-16 bg-gradient-to-b from-[#D48A30] to-[#8B4513] rounded-b-[40px] rounded-t-[10px] shadow-[inset_0_5px_15px_rgba(255,255,255,0.3),inset_0_-10px_20px_rgba(0,0,0,0.6),0_25px_35px_rgba(0,0,0,0.7)]" />
  </motion.div>
);
