import { motion } from 'motion/react';
import { MeatProps } from '../../types';
import { FC } from 'react';

export const Meat: FC<MeatProps> = ({ style, id, direction, isCollapsed, imageUrl }) => {
  // Si hay imagen, usarla; si no, usar el gradiente CSS
  if (imageUrl) {
    return (
      <motion.div 
        initial={{ x: direction * 300, opacity: 0, scale: 0.8 }} 
        animate={{ x: 0, opacity: 1, scale: 1 }} 
        exit={{ x: -direction * 300, opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="relative z-30"
      >
        <motion.img
          src={imageUrl}
          alt="Carne"
          className="w-40 h-auto drop-shadow-2xl"
          animate={{
            filter: isCollapsed 
              ? 'drop-shadow(0 15px 20px rgba(0,0,0,0.7))' 
              : 'drop-shadow(0 25px 30px rgba(0,0,0,0.5))',
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  }

  // Fallback: usar gradiente CSS original
  return (
    <motion.div 
      initial={{ x: direction * 300, opacity: 0, scale: 0.8 }} 
      animate={{ x: 0, opacity: 1, scale: 1 }} 
      exit={{ x: -direction * 300, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="relative z-30"
    >
      <div className={`w-52 h-14 rounded-[24px] shadow-[inset_0_-8px_15px_rgba(0,0,0,0.7),inset_0_4px_10px_rgba(255,255,255,0.2),0_20px_25px_rgba(0,0,0,0.6)] bg-gradient-to-b ${style} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-50 mix-blend-multiply bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.9)_100%)]" />
        {/* Grill marks */}
        <div className="absolute inset-0 flex justify-around items-center opacity-40 transform -rotate-12 scale-150">
          <div className="w-3 h-full bg-black blur-[2px]" />
          <div className="w-3 h-full bg-black blur-[2px]" />
          <div className="w-3 h-full bg-black blur-[2px]" />
          <div className="w-3 h-full bg-black blur-[2px]" />
        </div>
      </div>
    </motion.div>
  );
};
