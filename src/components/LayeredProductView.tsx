import { motion, AnimatePresence } from 'motion/react';
import { useMenu } from '../contexts/MenuContext';
import { Product, ProductOptionValue } from '../types';
import { TopBun, Cheese, Meat, Tomato, Lettuce, BottomBun } from './Burger';

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

  // Grosores específicos por tipo de ingrediente (en px)
  const ingredientHeights: Record<string, number> = {
    'bun-top': 25,
    'cheese': 12,
    'meat': 28,
    'tomato': 12,
    'lettuce': 15,
    'onion': 10,
    'pickle': 8,
    'bacon': 10,
    'egg': 20,
    'bun-bottom': 25,
  };

  // Componentes 3D fallback por tipo
  const fallbackComponents: Record<string, any> = {
    'bun-top': TopBun,
    'cheese': Cheese,
    'meat': Meat,
    'tomato': Tomato,
    'lettuce': Lettuce,
    'bun-bottom': BottomBun,
  };

  // Calcular translateY acumulativo basado en los ingredientes reales presentes
  const calculateTranslateY = (index: number) => {
    if (!isCollapsed) return 0;
    
    // Sumar las alturas de todos los ingredientes anteriores
    let accumulatedHeight = 0;
    for (let i = 0; i < index; i++) {
      const ing = productIngredients[i];
      const height = ingredientHeights[ing.type] || 20;
      accumulatedHeight += height;
    }
    
    return -accumulatedHeight;
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
      className="scale-90 sm:scale-100 lg:scale-110" 
    >
      <div className="relative w-64 h-80 mx-auto flex items-end justify-center">
        {productIngredients.map((ingredient, index) => {
          const zIndex = calculateZIndex(index);
          const overlapStep = 22; // Colapsado
          const expandedStep = 65; // Expandido (un poco más espaciado aquí)
          const totalIngredients = productIngredients.length;
          // Posiciones y centrado dinámico
          const bottomValueCollapsed = (totalIngredients - 1 - index) * overlapStep;
          const bottomValueExpanded = (totalIngredients - 1 - index) * expandedStep;
          const totalGrowth = (totalIngredients - 1) * (expandedStep - overlapStep);
          const centerOffset = totalGrowth / 2;
          const yCollapsed = -bottomValueCollapsed;
          const yExpanded = -bottomValueExpanded + centerOffset;
          const isVariableIngredient = ingredient.id === product.variableIngredientId;

          // Si es el ingrediente variable, usar la imagen y estilo de la opción seleccionada
          if (isVariableIngredient && variableOptionValue) {
            const imageUrl = variableOptionValue.image || ingredient.image;
            const style = variableOptionValue.style;

            return (
              <motion.div
                key={`${product.id}-${ingredient.id}`}
                className="absolute w-full flex justify-center"
                style={{ zIndex, bottom: 0 }}
                animate={{
                  y: isCollapsed ? yCollapsed : yExpanded,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <AnimatePresence mode="wait">
                  {imageUrl ? (
                    <motion.img
                      key={variableOptionValue.id}
                      src={imageUrl}
                      alt={variableOptionValue.name}
                      className="w-40 h-auto drop-shadow-2xl"
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
                    // Fallback: Si es type 'meat' usar el componente Meat, sino div normal
                    ingredient.type === 'meat' ? (
                      <Meat
                        key={variableOptionValue.id}
                        id={variableOptionValue.id}
                        style={style || 'bg-gray-500'}
                        direction={direction}
                        isCollapsed={isCollapsed}
                      />
                    ) : (
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
                    )
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
                className="absolute w-40 h-auto drop-shadow-2xl"
                style={{ zIndex, bottom: 0 }}
                animate={{
                  filter: isCollapsed
                    ? 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
                    : 'drop-shadow(0 20px 25px rgba(0,0,0,0.3))',
                  y: isCollapsed ? yCollapsed : yExpanded,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              />
            );
          }

          // Fallback: componente 3D si existe para ese tipo y no hay imagen
          const FallbackComponent = fallbackComponents[ingredient.type];
          if (FallbackComponent) {
            return (
              <motion.div
                key={`${product.id}-${ingredient.id}`}
                className="absolute"
                style={{ 
                  zIndex,
                  bottom: 0,
                  willChange: 'transform'
                }}
                animate={{
                  y: isCollapsed ? yCollapsed : yExpanded,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <FallbackComponent isCollapsed={isCollapsed} />
              </motion.div>
            );
          }

          // Si el ingrediente no tiene imagen ni fallback, no renderizarlo
          return null;
        })}
      </div>
    </motion.div>
  );
};
