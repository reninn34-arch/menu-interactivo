import { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ProductOptionsModal } from './ProductOptionsModal';

interface ProductCardProps {
  product: Product;
  onOrder?: () => void;
  onOrderWithOptions?: (selectedOptions: any[]) => void;
}

export const ProductCard = ({ product, onOrder, onOrderWithOptions }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasOptions = product.optionGroupIds && product.optionGroupIds.length > 0;

  const handleOrderClick = () => {
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      onOrder?.();
    }
  };

  const handleConfirmOptions = (selectedOptions: any[]) => {
    onOrderWithOptions?.(selectedOptions);
    setIsModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-orange-500/30 transition-all group"
      >
        {/* Imagen del producto */}
        <div className="w-full h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl sm:text-6xl">
              {product.categoryId === 'drinks' && '🥤'}
              {product.categoryId === 'sides' && '🍟'}
              {product.categoryId === 'desserts' && '🍰'}
            </span>
          )}
        </div>

        {/* Info del producto */}
        <div className="space-y-2 sm:space-y-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{product.name}</h3>
            {product.description && (
              <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{product.description}</p>
            )}
          </div>

          {/* Información nutricional simple */}
          {(product.calories || product.protein) && (
            <div className="flex gap-3 sm:gap-4 text-xs text-gray-400">
              {product.calories && (
                <span>{product.calories} Cal</span>
              )}
              {product.protein && (
                <span>{product.protein}g Proteína</span>
              )}
            </div>
          )}

          {/* Precio y botón */}
          <div className="flex items-center justify-between pt-1 sm:pt-2">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-orange-400">
                ${product.price.toFixed(2)}
              </span>
              {hasOptions && (
                <p className="text-xs text-gray-400 mt-1">+ opciones</p>
              )}
            </div>
            <motion.button
              onClick={handleOrderClick}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium text-xs sm:text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              Ordenar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Modal de opciones */}
      {hasOptions && (
        <ProductOptionsModal
          product={product}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmOptions}
        />
      )}
    </>
  );
};
