import { motion } from 'motion/react';
import { MeatOption } from '../types';
import { useMenu } from '../contexts/MenuContext';

interface MeatSelectorProps {
  meats: MeatOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const MeatSelector = ({ meats, selectedIndex, onSelect }: MeatSelectorProps) => {
  const { siteConfig } = useMenu();
  
  return (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-3 scrollbar-hide snap-x mb-2 sm:mb-4 lg:mb-6 -mx-3 px-3 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
      {meats.map((meat, idx) => (
        <motion.button 
          key={meat.id}
          onClick={() => onSelect(idx)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[85px] lg:min-w-[100px] p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl border transition-all snap-center"
          style={{
            background: selectedIndex === idx 
              ? `linear-gradient(to bottom, ${siteConfig.primaryColor || '#FF9F0A'}33, transparent)`
              : 'rgba(255,255,255,0.05)',
            borderColor: selectedIndex === idx 
              ? `${siteConfig.primaryColor || '#FF9F0A'}80`
              : 'rgba(255,255,255,0.05)',
            boxShadow: selectedIndex === idx 
              ? `0 0 15px ${siteConfig.primaryColor || '#FF9F0A'}26`
              : 'none'
          }}
          onMouseEnter={(e) => {
            if (selectedIndex !== idx) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedIndex !== idx) {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
        >
          <div className="w-12 h-9 sm:w-18 sm:h-13 lg:w-24 lg:h-16 flex items-center justify-center relative">
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
          <span 
            className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-center leading-tight"
            style={{ 
              color: selectedIndex === idx 
                ? (siteConfig.accentColor || '#FFB84D')
                : '#9CA3AF'
            }}
          >
            {meat.shortName}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
