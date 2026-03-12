import { useState, memo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ProductOptionsModal } from './ProductOptionsModal';
import { ProductBadges } from './ProductBadges';
import { useMenu } from '../contexts/MenuContext';

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
  const { siteConfig, optionGroups } = useMenu();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Only consider it "has options" if there is at least one enabled option group linked
  const hasOptions = (product.optionGroupIds || []).some(id => {
    const group = optionGroups.find(g => g.id === id);
    return group && group.enabled;
  });

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
        className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all group"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${siteConfig.primaryColor || '#FF9F0A'}4D`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }}
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
              <span 
                className="text-xl sm:text-2xl font-bold"
                style={{ color: siteConfig.accentColor || '#FFB84D' }}
              >
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
              className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all"
              style={
                product.inStock === false
                  ? {
                      backgroundColor: '#4B5563',
                      color: '#9CA3AF',
                      cursor: 'not-allowed'
                    }
                  : {
                      background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                      color: '#FFFFFF',
                      boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                    }
              }
              onMouseEnter={(e) => {
                if (product.inStock !== false) {
                  e.currentTarget.style.boxShadow = `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}80`;
                }
              }}
              onMouseLeave={(e) => {
                if (product.inStock !== false) {
                  e.currentTarget.style.boxShadow = `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`;
                }
              }}
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
