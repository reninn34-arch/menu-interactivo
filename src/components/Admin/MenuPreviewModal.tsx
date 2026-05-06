import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, ShoppingCart, Menu, Clock, Package } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { isRestaurantOpen } from '../../utils/openingHours';
import { LayeredProductView } from '../LayeredProductView';

interface MenuPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MenuPreviewModal = ({ isOpen, onClose }: MenuPreviewModalProps) => {
  const { products, categories, optionGroups, ingredients, siteConfig } = useMenu();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categories.find(c => c.isMain)?.id || categories[0]?.id || ''
  );
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [showCart, setShowCart] = useState(false);

  const restaurantStatus = isRestaurantOpen(siteConfig);
  const categoryProducts = products.filter(p => p.enabled && p.categoryId === selectedCategoryId);
  const selectedProduct = categoryProducts[selectedProductIndex];
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const isBurgerCategory = selectedCategory?.isMain === true;

  const handlePrevProduct = () => {
    setSelectedProductIndex(prev => prev > 0 ? prev - 1 : categoryProducts.length - 1);
  };

  const handleNextProduct = () => {
    setSelectedProductIndex(prev => prev < categoryProducts.length - 1 ? prev + 1 : 0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Vista Previa del Menú</h2>
              <p className="text-gray-400 text-xs">Como lo ven tus clientes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="h-screen pt-20 pb-4 px-4 flex flex-col"
        style={{
          background: `linear-gradient(to bottom right, ${siteConfig.backgroundColor || '#320A0A'}, #0A0604)`,
          color: siteConfig.textColor || '#FFFFFF'
        }}
      >
        {/* Restaurant Status */}
        {siteConfig.openingHours && !restaurantStatus.isOpen && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">❌ Cerrado - {restaurantStatus.message}</span>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {categories.filter(c => c.enabled).map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategoryId(category.id);
                setSelectedProductIndex(0);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategoryId === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {/* Product Display */}
        {selectedProduct && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Product Image / 3D Layered View */}
            <motion.div
              key={selectedProduct.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-48 h-48 rounded-2xl overflow-hidden mb-4 relative"
            >
              {selectedProduct.useLayeredView ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="transform scale-75 -mt-2">
                    <LayeredProductView
                      isCollapsed={true}
                      product={selectedProduct}
                      selectedOptions={{}}
                      direction={1}
                    />
                  </div>
                </div>
              ) : selectedProduct.image ? (
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <Package className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h3>
              {selectedProduct.description && (
                <p className="text-gray-400 text-sm mb-4 max-w-xs">{selectedProduct.description}</p>
              )}
              <p 
                className="text-3xl font-bold"
                style={{ color: siteConfig.primaryColor || '#FF9F0A' }}
              >
                {siteConfig.currencySymbol}{selectedProduct.price.toFixed(2)}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrevProduct}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <span className="text-gray-400 text-sm">
                {selectedProductIndex + 1} / {categoryProducts.length}
              </span>
              <button
                onClick={handleNextProduct}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="mt-8 px-8 py-3 rounded-full font-bold text-white flex items-center gap-2"
              style={{
                background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                boxShadow: `0 10px 20px -5px ${siteConfig.primaryColor || '#FF9F0A'}60`
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar al Carrito
            </motion.button>

            {/* Ingredient Pills */}
            {selectedProduct.ingredientIds && selectedProduct.ingredientIds.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-xs">
                {selectedProduct.ingredientIds.slice(0, 6).map(ingId => {
                  const ingredient = ingredients.find(i => i.id === ingId);
                  return ingredient ? (
                    <span 
                      key={ingId}
                      className="px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                    >
                      {ingredient.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Stats */}
        <div className="mt-auto pt-4 border-t border-white/10 flex justify-center gap-8 text-xs text-gray-500">
          <span>{products.filter(p => p.enabled).length} productos</span>
          <span>{categories.filter(c => c.enabled).length} categorías</span>
          <span>{siteConfig.siteName}</span>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
};