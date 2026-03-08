import { useState, memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ProductOptionsModal } from './ProductOptionsModal';
import { ProductBadges } from './ProductBadges';

interface ProductCardProps {
  product: Product;
  onOrder?: () => void;
  onOrderWithOptions?: (selectedOptions: any[], notes?: string) => void;
}

/**
 * ProductCard - Displays a product with image, price, and order button
 * 
 * Features:
 * - Product image or fallback icon
 * - Stock availability badges
 * - Estimated preparation time
 * - Nutritional information
 * - Options modal for customizable products
 * 
 * @param product - Product data including name, price, availability
 * @param onOrder - Callback for products without options
 * @param onOrderWithOptions - Callback for products with customization options
 */
export const ProductCard = memo(({ product, onOrder, onOrderWithOptions }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasOptions = product.optionGroupIds && product.optionGroupIds.length > 0;

  const handleOrderClick = useCallback(() => {
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      onOrder?.();
    }
  }, [hasOptions, onOrder]);

  const handleConfirmOptions = useCallback((selectedOptions: any[], notes?: string) => {
    onOrderWithOptions?.(selectedOptions, notes);
    setIsModalOpen(false);
  }, [onOrderWithOptions]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-orange-500/30 transition-all group"
      >
        {/* Imagen del producto */}
        <div className="relative w-full h-40 sm:h-48 mb-3 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
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
          
          {/* Badges de estado */}
          <ProductBadges product={product} className="absolute top-2 right-2" />
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
              disabled={product.inStock === false}
              whileTap={product.inStock !== false ? { scale: 0.95 } : {}}
              whileHover={product.inStock !== false ? { scale: 1.05 } : {}}
              className={`
                px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all
                ${
                  product.inStock === false
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50'
                }
              `}
            >
              {product.inStock === false ? 'No disponible' : 'Ordenar'}
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
});
