import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductOptionGroup, SelectedOption } from '../types';
import { useMenu } from '../contexts/MenuContext';
import { LayeredProductView } from './LayeredProductView';

interface InteractiveProductViewProps {
  product: Product;
  onAddToCart: (selectedOptions: SelectedOption[]) => void;
}

export const InteractiveProductView = ({ product, onAddToCart }: InteractiveProductViewProps) => {
  const { optionGroups } = useMenu();
  const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map());
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [direction, setDirection] = useState(1);
  const [prevLinkedValue, setPrevLinkedValue] = useState<string | null>(null);

  // Obtener los grupos de opciones para este producto
  const productOptionGroups = optionGroups.filter(
    group => product.optionGroupIds?.includes(group.id) && group.enabled
  ).sort((a, b) => a.order - b.order);

  // Inicializar selecciones con valores por defecto
  useEffect(() => {
    const initialSelections = new Map<string, Set<string>>();
    productOptionGroups.forEach(group => {
      const defaultValue = group.values.find(v => v.enabled);
      if (group.required && defaultValue) {
        initialSelections.set(group.id, new Set([defaultValue.id]));
      } else {
        initialSelections.set(group.id, new Set());
      }
    });
    setSelections(initialSelections);
  }, [product.id]);

  const handleOptionToggle = (groupId: string, valueId: string, multiSelect: boolean) => {
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    // Si es el grupo de opciones vinculado y el producto usa vista por capas, animar separación
    if (product.useLayeredView && product.linkedOptionGroupId === groupId) {
      const currentValue = selections.get(groupId)?.values().next().value;
      if (currentValue !== valueId) {
        // Determinar dirección basada en el índice de las opciones
        const group = optionGroups.find(g => g.id === groupId);
        if (group) {
          const currentIndex = group.values.findIndex(v => v.id === currentValue);
          const newIndex = group.values.findIndex(v => v.id === valueId);
          setDirection(newIndex > currentIndex ? 1 : -1);
        }
        setPrevLinkedValue(currentValue);
        
        // Separar capas
        setIsCollapsed(false);
        // Juntar después de 800ms
        setTimeout(() => {
          setIsCollapsed(true);
        }, 800);
      }
    }

    setSelections(prev => {
      const newSelections = new Map(prev);
      const existingSet = newSelections.get(groupId) as Set<string> | undefined;
      const currentSet = new Set<string>(existingSet ? Array.from(existingSet) : []);

      if (multiSelect) {
        if (currentSet.has(valueId)) {
          currentSet.delete(valueId);
        } else {
          currentSet.add(valueId);
        }
        newSelections.set(groupId, currentSet);
      } else {
        newSelections.set(groupId, new Set([valueId]));
      }

      return newSelections;
    });
  };

  const calculateTotal = () => {
    let total = product.price;
    
    selections.forEach((valueIds, groupId) => {
      const group = optionGroups.find(g => g.id === groupId);
      if (group) {
        valueIds.forEach(valueId => {
          const value = group.values.find(v => v.id === valueId);
          if (value) {
            total += value.priceModifier;
          }
        });
      }
    });

    return total;
  };

  const isValid = () => {
    return productOptionGroups.every(group => {
      const selected = selections.get(group.id) || new Set();
      const count = selected.size;

      if (group.required && count === 0) return false;
      if (group.minSelections && count < group.minSelections) return false;
      if (group.maxSelections && count > group.maxSelections) return false;

      return true;
    });
  };

  const handleAddToCart = () => {
    const selectedOptions: SelectedOption[] = [];

    selections.forEach((valueIds, groupId) => {
      if (valueIds.size > 0) {
        const group = optionGroups.find(g => g.id === groupId);
        if (group) {
          const valueNames: string[] = [];
          let totalPrice = 0;

          valueIds.forEach(valueId => {
            const value = group.values.find(v => v.id === valueId);
            if (value) {
              valueNames.push(value.name);
              totalPrice += value.priceModifier;
            }
          });

          selectedOptions.push({
            groupId,
            groupName: group.name,
            valueIds: Array.from(valueIds),
            valueNames,
            totalPrice,
          });
        }
      }
    });

    onAddToCart(selectedOptions);
  };

  // Obtener descripción de selecciones actuales para mostrar
  const getSelectionDescription = () => {
    const descriptions: string[] = [];
    selections.forEach((valueIds, groupId) => {
      if (valueIds.size > 0) {
        const group = optionGroups.find(g => g.id === groupId);
        if (group) {
          const names = Array.from(valueIds).map(valueId => {
            const value = group.values.find(v => v.id === valueId);
            return value?.name || '';
          }).filter(Boolean);
          if (names.length > 0) {
            descriptions.push(names.join(', '));
          }
        }
      }
    });
    return descriptions.join(' • ');
  };

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center gap-3 lg:gap-8 xl:gap-16 py-0 lg:py-8">
      {/* Product Visualization */}
      <div className="w-full lg:w-1/2 max-w-md mx-auto">
        <motion.div
          className="relative bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-md rounded-2xl lg:rounded-3xl border border-white/10 overflow-hidden"
          animate={isAnimating ? { scale: [1, 0.95, 1.05, 1] } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Product Visualization: Layered View or Image */}
          <div className="flex items-center justify-center py-4 lg:py-8 px-4">
            {product.useLayeredView && product.linkedOptionGroupId ? (
              // Render LayeredProductView for products with layered animation
              <div className="w-full h-48 lg:h-64 flex items-center justify-center">
                <LayeredProductView
                  isCollapsed={isCollapsed}
                  product={product}
                  selectedOptions={Object.fromEntries(
                    Array.from(selections.entries() as IterableIterator<[string, Set<string>]>).map(([groupId, valueIds]) => [
                      groupId,
                      Array.from(valueIds)[0] || ''
                    ])
                  )}
                  direction={direction}
                />
              </div>
            ) : (
              // Standard image rendering for non-layered products
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${product.id}-${getSelectionDescription()}`}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-48 lg:h-64 flex items-center justify-center"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl"
                    />
                  ) : (
                    <span className="text-6xl lg:text-9xl">
                      {product.categoryId === 'drinks' && '🥤'}
                      {product.categoryId === 'sides' && '🍟'}
                      {product.categoryId === 'desserts' && '🍰'}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Product Name & Info - Bottom Section with Overlap */}
          <div className="-mt-32 lg:-mt-28 relative z-10 bg-black/50 backdrop-blur-lg border-t border-white/10 rounded-b-2xl lg:rounded-b-3xl p-4 lg:p-6 pt-8 lg:pt-10 text-center shadow-2xl">
            <h2 className="text-xl lg:text-3xl font-bold text-white mb-1">{product.name}</h2>
            {product.description && (
              <p className="text-gray-400 text-xs lg:text-sm mb-2">{product.description}</p>
            )}
            
            {/* Current Selection */}
            {getSelectionDescription() && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg inline-flex"
              >
                <p className="text-orange-400 text-xs font-medium">
                  {getSelectionDescription()}
                </p>
              </motion.div>
            )}

            {/* Nutritional Info */}
            {product.calories && (
              <div className="flex gap-2 lg:gap-3 justify-center mt-2 text-xs text-gray-400 flex-wrap">
                <span className="font-semibold">{product.calories} Cal</span>
                {product.protein && <span>{product.protein}g Prot</span>}
                {product.fat && <span>{product.fat}g Grasa</span>}
                {product.carbs && <span>{product.carbs}g Carb</span>}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Options Panel */}
      <div className="w-full lg:w-1/2 max-w-md mx-auto space-y-3 lg:space-y-6 px-4 lg:px-0">
        <div className="text-center lg:text-left">
          <h3 className="text-lg lg:text-2xl font-bold text-white mb-1">Personaliza tu Orden</h3>
          <p className="text-gray-400 text-xs lg:text-sm">Selecciona las opciones que desees</p>
        </div>

        {/* Option Groups */}
        <div className="space-y-3 lg:space-y-6">
          {productOptionGroups.map(group => {
            const selected = selections.get(group.id) || new Set();
            
            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm lg:text-lg font-semibold text-white">
                    {group.name}
                    {group.required && <span className="text-orange-500 ml-1">*</span>}
                  </h4>
                  {group.multiSelect && group.maxSelections && (
                    <span className="text-xs text-gray-400">
                      {selected.size}/{group.maxSelections}
                    </span>
                  )}
                </div>
                
                {group.description && (
                  <p className="text-xs lg:text-sm text-gray-400">{group.description}</p>
                )}

                <div className="space-y-2">
                  {group.values.filter(v => v.enabled).map(value => {
                    const isSelected = selected.has(value.id);
                    
                    return (
                      <motion.button
                        key={value.id}
                        onClick={() => handleOptionToggle(group.id, value.id, group.multiSelect)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center justify-between p-2.5 lg:p-4 rounded-lg lg:rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                            : 'border-gray-700 bg-white/5 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Imagen del valor si existe */}
                          {value.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                              <img 
                                src={value.image} 
                                alt={value.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          <div className={`w-4 h-4 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-600'
                          }`}>
                            {isSelected && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-2.5 h-2.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </motion.svg>
                            )}
                          </div>
                          <span className="text-sm lg:text-base text-white font-medium">{value.name}</span>
                        </div>
                        {value.priceModifier !== 0 && (
                          <span className={`text-xs lg:text-sm font-semibold ${
                            value.priceModifier > 0 ? 'text-orange-400' : 'text-green-400'
                          }`}>
                            {value.priceModifier > 0 ? '+' : ''}${value.priceModifier.toFixed(2)}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add to Cart Button */}
        <motion.button
          onClick={handleAddToCart}
          disabled={!isValid()}
          whileHover={isValid() ? { scale: 1.02 } : {}}
          whileTap={isValid() ? { scale: 0.98 } : {}}
          className={`w-full py-3 lg:py-4 rounded-lg lg:rounded-xl font-bold text-sm lg:text-lg transition-all ${
            isValid()
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50 hover:shadow-orange-500/70'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          Agregar - ${calculateTotal().toFixed(2)}
        </motion.button>
      </div>
    </div>
  );
};
