import React from 'react';
import { motion } from 'motion/react';
import { InteractiveProductView } from '../InteractiveProductView';
import { Product, SiteConfig, SelectedOption } from '../../types';

interface InteractiveViewProps {
  categoryProducts: Product[];
  selectedProduct: Product;
  selectedProductIndex: number;
  onSelectProductIndex: (index: number) => void;
  siteConfig: SiteConfig;
  onAddToCart: (selectedOptions: SelectedOption[], notes?: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export const InteractiveView = ({
  categoryProducts,
  selectedProduct,
  selectedProductIndex,
  onSelectProductIndex,
  siteConfig,
  onAddToCart,
  onTouchStart,
  onTouchEnd,
}: InteractiveViewProps) => {
  return (
    <div
      className="z-20 w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Product Selector – only when multiple products */}
      {categoryProducts.length > 1 && (
        <>
          {/* Desktop: horizontal buttons */}
          <div className="hidden md:flex gap-2 lg:gap-3 pb-2 lg:pb-4 mb-4 lg:mb-6 justify-center flex-wrap">
            {categoryProducts.map((prod, index) => (
              <button
                key={prod.id}
                onClick={() => onSelectProductIndex(index)}
                className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all"
                style={selectedProductIndex === index ? {
                  background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                  color: '#FFFFFF',
                  boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                } : {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#D1D5DB'
                }}
                onMouseEnter={(e) => {
                  if (selectedProductIndex !== index) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedProductIndex !== index) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {prod?.name}
              </button>
            ))}
          </div>

          {/* Mobile: draggable carousel */}
          <div className="md:hidden mb-4">
            <div className="relative overflow-hidden">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_e, { offset, velocity }) => {
                  const swipeThreshold = 50;
                  const velocityThreshold = 200;
                  if ((offset.x < -swipeThreshold || velocity.x < -velocityThreshold) && selectedProductIndex < categoryProducts.length - 1) {
                    onSelectProductIndex(selectedProductIndex + 1);
                  } else if ((offset.x > swipeThreshold || velocity.x > velocityThreshold) && selectedProductIndex > 0) {
                    onSelectProductIndex(selectedProductIndex - 1);
                  }
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  key={selectedProductIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex justify-center px-4"
                >
                  <div
                    className="text-white px-6 py-3 rounded-xl text-center font-medium max-w-full"
                    style={{
                      background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                      boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                    }}
                  >
                    {categoryProducts[selectedProductIndex]?.name}
                  </div>
                </motion.div>
              </motion.div>
            </div>
            {/* Carousel dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {categoryProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onSelectProductIndex(index)}
                  className="h-1.5 rounded-full transition-all"
                  style={selectedProductIndex === index ? {
                    width: '1.5rem',
                    backgroundColor: siteConfig.primaryColor || '#FF9F0A'
                  } : {
                    width: '0.375rem',
                    backgroundColor: '#4B5563'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProductIndex !== index) {
                      e.currentTarget.style.backgroundColor = '#6B7280';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProductIndex !== index) {
                      e.currentTarget.style.backgroundColor = '#4B5563';
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <InteractiveProductView
        product={selectedProduct}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};
