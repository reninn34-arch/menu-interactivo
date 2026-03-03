import { motion } from 'motion/react';
import { BurgerComponentProps } from '../../types';

export const Lettuce = ({ isCollapsed }: BurgerComponentProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ 
      y: isCollapsed ? 0 : 0,
      opacity: 1,
    }} 
    transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
    className="relative z-10"
  >
    <div className="w-56 h-8 bg-gradient-to-b from-[#7CFC00] to-[#228B22] rounded-[20px] shadow-[inset_0_-5px_15px_rgba(0,0,0,0.6),inset_0_4px_10px_rgba(255,255,255,0.4),0_15px_25px_rgba(0,0,0,0.5)] relative">
      <div className="absolute -bottom-3 left-2 w-12 h-8 bg-gradient-to-b from-[#32CD32] to-[#006400] rounded-full shadow-lg" />
      <div className="absolute -bottom-4 left-14 w-16 h-10 bg-gradient-to-b from-[#32CD32] to-[#006400] rounded-full shadow-lg" />
      <div className="absolute -bottom-3 right-12 w-14 h-9 bg-gradient-to-b from-[#32CD32] to-[#006400] rounded-full shadow-lg" />
      <div className="absolute -bottom-2 right-2 w-10 h-7 bg-gradient-to-b from-[#32CD32] to-[#006400] rounded-full shadow-lg" />
    </div>
  </motion.div>
);
