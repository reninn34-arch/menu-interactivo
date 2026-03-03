import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';

interface OrderButtonProps {
  price: number;
  onOrder?: () => void;
}

export const OrderButton = ({ price, onOrder }: OrderButtonProps) => {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onOrder}
      className="w-full bg-gradient-to-r from-[#FF9F0A] to-[#FF7A00] text-white rounded-full py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 flex items-center justify-between font-bold text-base sm:text-lg lg:text-xl shadow-[0_10px_25px_rgba(255,159,10,0.4)] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-[1.5s]" />
      <div className="flex items-center gap-2 sm:gap-3 relative z-10">
        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        <span className="hidden xs:inline">Agregar al Carrito</span>
        <span className="xs:hidden">Agregar</span>
      </div>
      <span className="bg-black/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-sm sm:text-base lg:text-base relative z-10">
        $ {price.toFixed(2)}
      </span>
    </motion.button>
  );
};
