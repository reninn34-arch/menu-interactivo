import { motion, AnimatePresence } from 'motion/react';
import { useMenu } from '../contexts/MenuContext';
import { Product, ProductOptionValue } from '../types';

interface LayeredProductViewProps {
  isCollapsed: boolean;
  product: Product;
  selectedOptions: Record<string, string>; // groupId -> optionValueId
  direction: number;
}

export const LayeredProductView = ({ 
  isCollapsed, 
  product, 
  selectedOptions,
  direction 
}: LayeredProductViewProps) => {
  const { ingredients, optionGroups } = useMenu();

  // Obtener solo los ingredientes asignados a este producto
  const productIngredients = product.ingredientIds
    ? ingredients
        .filter(ing => product.ingredientIds!.includes(ing.id) && ing.enabled)
        .sort((a, b) => a.order - b.order)
    : [];

  // Obtener el valor de opción seleccionado para el ingrediente variable
  let variableOptionValue: ProductOptionValue | undefined;
  if (product.linkedOptionGroupId && product.variableIngredientId) {
    const selectedValueId = selectedOptions[product.linkedOptionGroupId];
    const linkedGroup = optionGroups.find(g => g.id === product.linkedOptionGroupId);
    if (linkedGroup && selectedValueId) {
      variableOptionValue = linkedGroup.values.find(v => v.id === selectedValueId);
    }
  }

  // Calcular translateY dinámicamente basado en el índice
  const calculateTranslateY = (index: number) => {
    if (!isCollapsed) return 0;
    return -(index * 50); // 50px de superposición por cada ingrediente
  };

  // Calcular z-index dinámicamente
  const calculateZIndex = (index: number) => {
    return 50 - index;
  };

  return (
    <motion.div 
      animate={{ 
        y: isCollapsed ? [0, -5, 0] : [0, -8, 0],
      }}
      transition={{ duration: isCollapsed ? 2 : 4, repeat: Infinity, ease: "easeInOut" }}
      className="scale-90 sm:scale-100 lg:scale-110 relative" 
    >
      <motion.div 
        className="flex flex-col items-center"
        style={{ gap: 0 }}
      >
        {productIngredients.map((ingredient, index) => {
          const translateY = calculateTranslateY(index);
          const zIndex = calculateZIndex(index);
          const isVariableIngredient = ingredient.id === product.variableIngredientId;

          // Si es el ingrediente variable, usar la imagen y estilo de la opción seleccionada
          if (isVariableIngredient && variableOptionValue) {
            const imageUrl = variableOptionValue.image || ingredient.image;
            const style = variableOptionValue.style;

            return (
              <motion.div
                key={`${product.id}-${ingredient.id}`}
                className="relative w-full flex justify-center"
                style={{ zIndex }}
                animate={{
                  y: translateY,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <AnimatePresence mode="wait">
                  {imageUrl ? (
                    <motion.img
                      key={variableOptionValue.id}
                      src={imageUrl}
                      alt={variableOptionValue.name}
                      className="w-40 h-auto drop-shadow-2xl relative"
                      initial={{ 
                        x: direction > 0 ? 100 : -100, 
                        opacity: 0,
                        rotateY: direction > 0 ? 45 : -45 
                      }}
                      animate={{ 
                        x: 0, 
                        opacity: 1,
                        rotateY: 0,
                        filter: isCollapsed
                          ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                          : 'drop-shadow(0 20px 25px rgba(0,0,0,0.3))'
                      }}
                      exit={{ 
                        x: direction > 0 ? -100 : 100, 
                        opacity: 0,
                        rotateY: direction > 0 ? -45 : 45 
                      }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.34, 1.56, 0.64, 1] 
                      }}
                    />
                  ) : (
                    // Fallback: div con gradiente si no hay imagen
                    <motion.div
                      key={variableOptionValue.id}
                      className={`w-40 h-20 rounded-full ${style || 'bg-gray-500'}`}
                      initial={{ 
                        x: direction > 0 ? 100 : -100, 
                        opacity: 0,
                        rotateY: direction > 0 ? 45 : -45 
                      }}
                      animate={{ 
                        x: 0, 
                        opacity: 1,
                        rotateY: 0
                      }}
                      exit={{ 
                        x: direction > 0 ? -100 : 100, 
                        opacity: 0,
                        rotateY: direction > 0 ? -45 : 45 
                      }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.34, 1.56, 0.64, 1] 
                      }}
                      style={{
                        filter: isCollapsed
                          ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                          : 'drop-shadow(0 20px 25px rgba(0,0,0,0.3))'
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          // Ingredientes no variables: renderizado normal
          if (ingredient.image) {
            return (
              <motion.img
                key={`${product.id}-${ingredient.id}`}
                src={ingredient.image}
                alt={ingredient.name}
                className="w-40 h-auto drop-shadow-2xl relative"
                style={{ zIndex }}
                animate={{
                  filter: isCollapsed
                    ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                    : 'drop-shadow(0 20px 25px rgba(0,0,0,0.3))',
                  y: translateY,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              />
            );
          }

          // Si el ingrediente no tiene imagen, no renderizarlo
          return null;
        })}
      </motion.div>
    </motion.div>
  );
};
