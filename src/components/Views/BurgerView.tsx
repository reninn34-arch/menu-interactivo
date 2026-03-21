import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayeredProductView } from '../LayeredProductView';
import { MeatSelector } from '../MeatSelector';
import { NutritionalInfo } from '../NutritionalInfo';
import { ProductOptionsModal } from '../ProductOptionsModal';
import { MapPin } from 'lucide-react';
import { Product, MeatOption, ProductOptionGroup, SiteConfig, SelectedOption } from '../../types';

interface BurgerViewProps {
  categoryProducts: Product[];
  selectedProduct: Product;
  selectedProductIndex: number;
  onSelectProductIndex: (index: number) => void;
  meats: MeatOption[];
  meatIndex: number;
  prevMeatIndex: number;
  onMeatChange: (index: number) => void;
  optionGroups: ProductOptionGroup[];
  linkedGroupId: string;
  selectedMeat: MeatOption;
  siteConfig: SiteConfig;
  showSidebar: boolean;
  showCart: boolean;
  onAddItem: (product: Product, meat: MeatOption, selectedOptions?: SelectedOption[], quantity?: number, notes?: string) => void;
}

export const BurgerView = ({
  categoryProducts,
  selectedProduct,
  selectedProductIndex,
  onSelectProductIndex,
  meats,
  meatIndex,
  onMeatChange,
  optionGroups,
  linkedGroupId,
  selectedMeat,
  siteConfig,
  showSidebar,
  showCart,
  onAddItem,
}: BurgerViewProps) => {
  const [showMeatSelector, setShowMeatSelector] = useState(false);
  const [meatSelected, setMeatSelected] = useState(false);
  const [showBurgerOptions, setShowBurgerOptions] = useState(false);
  const direction = 1; // handled by parent via meatIndex changes

  const meatOptionGroup = optionGroups.find(g => g.id === linkedGroupId);

  return (
    <div className="z-20 w-full">
      {/* ✨ Product Selector – Carousel on mobile, buttons on desktop */}
      {categoryProducts.length > 0 && (
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
                style={{ willChange: 'transform' }}
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

      {/* Burger Layout */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-8 xl:gap-16">
        {/* Burger Visualization */}
        <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-end py-0 lg:py-8 z-10 min-h-[160px] lg:min-h-[400px]">
          <LayeredProductView
            isCollapsed={!showMeatSelector}
            product={selectedProduct}
            selectedOptions={{
              [selectedProduct.linkedOptionGroupId || 'meat-type']: selectedMeat.id
            }}
            direction={direction}
            shouldAnimate={!showSidebar && !showCart}
          />
        </div>

        {/* Info Panel */}
        <div className="w-full lg:w-1/2 flex flex-col z-20 bg-[#0A0A0A]/40 lg:bg-transparent p-3 sm:p-4 lg:p-0 rounded-2xl lg:rounded-[2rem] backdrop-blur-md border border-white/5 lg:border-none shadow-2xl lg:shadow-none">
          <motion.div
            key={selectedProduct.id + '-title'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-0 lg:mb-4 text-center lg:text-left"
          >
            <h1 className="text-lg sm:text-xl lg:text-4xl xl:text-5xl font-bold mb-0 lg:mb-3 tracking-tight">{selectedProduct?.name}</h1>
            <div className="flex items-center justify-center lg:justify-start gap-1 text-gray-400 text-[10px] lg:text-base">
              <MapPin className="w-2.5 h-2.5 lg:w-4 lg:h-4" />
              <span>Sucursal Principal</span>
            </div>
          </motion.div>

          {selectedMeat ? (
            <NutritionalInfo meat={{
              id: selectedMeat.id,
              name: selectedMeat?.name,
              style: '',
              price: selectedProduct.price + selectedMeat.price,
              calories: (selectedProduct.calories || 0) + selectedMeat.calories,
              protein: (selectedProduct.protein || 0) + selectedMeat.protein,
              fat: (selectedProduct.fat || 0) + selectedMeat.fat,
              carbs: (selectedProduct.carbs || 0) + selectedMeat.carbs,
              shortName: selectedMeat?.name,
            }} />
          ) : (
            <div className="text-center text-gray-400 py-4">No hay información nutricional.</div>
          )}

          {/* "Seleccionar" button */}
          {!showMeatSelector && !meatSelected && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowMeatSelector(true)}
              className="w-full mt-1 lg:mt-6 px-6 py-2.5 lg:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all shadow-lg hover:shadow-xl text-sm lg:text-lg"
            >
              Seleccionar
            </motion.button>
          )}

          {/* Meat Selector */}
          <AnimatePresence>
            {showMeatSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-2 lg:mb-6"
              >
                <h3 className="text-xs font-semibold text-gray-400 mb-1 lg:mb-3 text-center lg:text-left">
                  {meatOptionGroup ? meatOptionGroup.name : 'Selecciona tu opción'}
                </h3>
                <MeatSelector
                  meats={meats}
                  selectedIndex={meatIndex}
                  onSelect={onMeatChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* "Elegir" button */}
          {showMeatSelector && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => {
                const extraOptions = (selectedProduct.optionGroupIds?.filter(id => id !== linkedGroupId) || []).filter(id => {
                  const group = optionGroups.find(g => g.id === id);
                  return group && group.enabled;
                });
                if (extraOptions.length > 0) {
                  setShowMeatSelector(false);
                  setMeatSelected(true);
                  setShowBurgerOptions(true);
                } else {
                  onAddItem(selectedProduct, meats[meatIndex], undefined, 1);
                  setShowMeatSelector(false);
                }
              }}
              className="w-full text-white rounded-full py-2 sm:py-2.5 lg:py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-bold text-sm sm:text-base lg:text-xl relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                boxShadow: `0 10px 25px rgba(${parseInt(siteConfig.primaryColor?.slice(1, 3) || 'FF', 16)}, ${parseInt(siteConfig.primaryColor?.slice(3, 5) || '9F', 16)}, ${parseInt(siteConfig.primaryColor?.slice(5, 7) || '0A', 16)}, 0.4)`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-[1.5s]" />
              <span className="relative z-10">Elegir</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Extra options modal */}
      {showBurgerOptions && (
        <ProductOptionsModal
          product={selectedProduct}
          isOpen={showBurgerOptions}
          onClose={() => setShowBurgerOptions(false)}
          excludedGroupIds={[linkedGroupId]}
          basePriceOverride={selectedProduct.price + selectedMeat.price}
          onConfirm={(selectedOptions, notes) => {
            onAddItem(selectedProduct, selectedMeat, selectedOptions, 1, notes);
            setShowBurgerOptions(false);
          }}
        />
      )}
    </div>
  );
};
