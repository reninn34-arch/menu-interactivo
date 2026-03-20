import { motion } from 'motion/react';
import { BurgerComponentProps } from '../../types';

export const Tomato = ({ isCollapsed }: BurgerComponentProps) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }} 
    animate={{ 
      y: isCollapsed ? 0 : 0,
      opacity: 1,
    }} 
    transition={{ delay: 0.25, type: 'tween', duration: 0.2, ease: 'easeOut' }}
    className="relative z-20 flex gap-2"
    style={{ willChange: 'transform, opacity' }}
  >
    <div className={`w-24 h-5 bg-gradient-to-b from-[#FF4500] to-[#B22222] rounded-[12px] border border-[#FF6347] ${
      isCollapsed
        ? 'shadow-[inset_0_-3px_8px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.4)]'
        : 'shadow-[inset_0_-3px_8px_rgba(0,0,0,0.5),inset_0_2px_5px_rgba(255,255,255,0.4),0_15px_20px_rgba(0,0,0,0.5)]'
    }`} />
  </motion.div>
);
