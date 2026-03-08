import type { Product } from '../types';

interface ProductBadgesProps {
  product: Product;
  className?: string;
}

/**
 * ProductBadges - Displays availability and estimated time badges for a product
 * 
 * Shows visual indicators for:
 * - Out of stock status (red "Agotado" badge)
 * - Estimated preparation time (orange "~15 min" badge)
 * 
 * @param product - Product with inStock and estimatedTime properties
 * @param className - Optional additional CSS classes for positioning
 * 
 * @example
 * <div className="relative">
 *   <img src={product.image} alt={product.name} />
 *   <ProductBadges product={product} className="absolute top-2 right-2" />
 * </div>
 */
export const ProductBadges = ({ product, className = '' }: ProductBadgesProps) => {
  // Don't render anything if no badges needed
  if (product.inStock !== false && !product.estimatedTime) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Out of Stock Badge */}
      {product.inStock === false && (
        <span className="px-3 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg">
          Agotado
        </span>
      )}
      
      {/* Estimated Time Badge - Only show if in stock */}
      {product.estimatedTime && product.inStock !== false && (
        <span className="px-3 py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg">
          ~{product.estimatedTime} min
        </span>
      )}
    </div>
  );
};
