import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export const ProductSelector = ({ products, selectedIndex, onSelect }: ProductSelectorProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x mb-6 lg:mb-8 -mx-6 px-6 lg:mx-0 lg:px-0">
      {products.map((product, idx) => (
        <motion.button 
          key={product.id}
          onClick={() => onSelect(idx)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`flex flex-col items-center gap-3 min-w-[90px] lg:min-w-[100px] p-3 lg:p-4 rounded-[24px] border border-white/5 transition-all snap-center ${
            selectedIndex === idx 
              ? 'bg-gradient-to-b from-orange-500/20 to-transparent border-orange-500/50 shadow-[0_0_15px_rgba(255,159,10,0.15)]' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          <div className="w-20 h-14 lg:w-24 lg:h-16 flex items-center justify-center relative">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-lg rounded-lg"
              />
            ) : (
              <div className="w-full h-full rounded-[12px] bg-gradient-to-b from-orange-500/30 to-orange-600/20 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center">
                <span className="text-3xl">🍔</span>
              </div>
            )}
          </div>
          <span className={`text-[11px] lg:text-xs font-medium text-center leading-tight ${selectedIndex === idx ? 'text-orange-400' : 'text-gray-400'} max-w-[90px] line-clamp-2`}>
            {product.name}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
