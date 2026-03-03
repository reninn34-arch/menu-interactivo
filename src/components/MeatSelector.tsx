import { motion } from 'motion/react';
import { MeatOption } from '../types';

interface MeatSelectorProps {
  meats: MeatOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const MeatSelector = ({ meats, selectedIndex, onSelect }: MeatSelectorProps) => {
  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide snap-x mb-4 sm:mb-6 lg:mb-8 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {meats.map((meat, idx) => (
        <motion.button 
          key={meat.id}
          onClick={() => onSelect(idx)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`flex flex-col items-center gap-2 sm:gap-3 min-w-[80px] sm:min-w-[90px] lg:min-w-[100px] p-2.5 sm:p-3 lg:p-4 rounded-2xl sm:rounded-[24px] border border-white/5 transition-all snap-center ${
            selectedIndex === idx 
              ? 'bg-gradient-to-b from-orange-500/20 to-transparent border-orange-500/50 shadow-[0_0_15px_rgba(255,159,10,0.15)]' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="w-16 h-12 sm:w-20 sm:h-14 lg:w-24 lg:h-16 flex items-center justify-center relative">
            {meat.image ? (
              <img 
                src={meat.image} 
                alt={meat.name}
                className="w-full h-full object-contain drop-shadow-lg"
              />
            ) : (
              <div className={`w-full h-full rounded-[12px] bg-gradient-to-b ${meat.style} shadow-[inset_0_-4px_8px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.4)] relative overflow-hidden`}>
                {/* Mini grill marks for thumbnail */}
                <div className="absolute inset-0 flex justify-around items-center opacity-30 transform -rotate-12 scale-150">
                  <div className="w-1 h-full bg-black blur-[1px]" />
                  <div className="w-1 h-full bg-black blur-[1px]" />
                  <div className="w-1 h-full bg-black blur-[1px]" />
                </div>
              </div>
            )}
          </div>
          <span className={`text-[10px] sm:text-[11px] lg:text-xs font-medium text-center leading-tight ${selectedIndex === idx ? 'text-orange-400' : 'text-gray-400'}`}>
            {meat.shortName}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
