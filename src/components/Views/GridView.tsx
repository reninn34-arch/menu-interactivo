import { motion } from 'motion/react';
import { ProductCard } from '../ProductCard';
import { Product, Category, SelectedOption } from '../../types';

interface GridViewProps {
  categoryProducts: Product[];
  selectedCategory?: Category;
  onOrder: (product: Product) => void;
  onOrderWithOptions: (product: Product, selectedOptions: SelectedOption[], notes?: string) => void;
}

export const GridView = ({
  categoryProducts,
  selectedCategory,
  onOrder,
  onOrderWithOptions,
}: GridViewProps) => {
  return (
    <div className="z-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 lg:mb-8"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{selectedCategory?.name}</h2>
        {selectedCategory?.description && (
          <p className="text-sm sm:text-base text-gray-400">{selectedCategory.description}</p>
        )}
      </motion.div>

      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard
              {...{ key: product.id }}
              product={product}
              onOrder={() => onOrder(product)}
              onOrderWithOptions={(selectedOptions, notes) => onOrderWithOptions(product, selectedOptions, notes)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20">
          <p className="text-gray-400 text-base sm:text-lg">No hay productos disponibles en esta categoría</p>
        </div>
      )}
    </div>
  );
};
