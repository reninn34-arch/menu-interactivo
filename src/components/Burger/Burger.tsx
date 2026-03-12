import { motion, AnimatePresence } from 'motion/react';
import { TopBun } from './TopBun';
import { Cheese } from './Cheese';
import { Meat } from './Meat';
import { Tomato } from './Tomato';
import { Lettuce } from './Lettuce';
import { BottomBun } from './BottomBun';
import { useMenu } from '../../contexts/MenuContext';
import { Product, MeatOption } from '../../types';

interface BurgerProps {
  isCollapsed: boolean;
  product: Product;
  selectedMeat: MeatOption;
  direction: number;
  shouldAnimate?: boolean;
}

export const Burger = ({ isCollapsed, product, selectedMeat, direction, shouldAnimate = true }: BurgerProps) => {
  const { ingredients } = useMenu();

  // Obtener solo los ingredientes asignados a este producto
  const productIngredients = product.ingredientIds
    ? ingredients
        .filter(ing => product.ingredientIds!.includes(ing.id) && ing.enabled)
        .sort((a, b) => a.order - b.order)
    : [];

  // Componentes 3D fallback por tipo
  const fallbackComponents: Record<string, any> = {
    'bun-top': TopBun,
    'cheese': Cheese,
    'meat': Meat,
    'tomato': Tomato,
    'lettuce': Lettuce,
    'bun-bottom': BottomBun,
  };

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
      animate={shouldAnimate ? { 
        y: isCollapsed ? [0, -5, 0] : [0, -8, 0],
      } : { y: 0 }}
      transition={{ 
        duration: isCollapsed ? 1.5 : 3, 
        repeat: shouldAnimate ? Infinity : 0, 
        ease: "easeInOut",
        delay: shouldAnimate ? 0.2 : 0
      }}
      className="scale-85 sm:scale-95 lg:scale-110"
      style={{ willChange: 'transform' }}
    >
      <div className="relative w-64 h-80 sm:h-80 mx-auto flex items-end justify-center">
        {productIngredients.map((ingredient, index) => {
          const zIndex = calculateZIndex(index);
          const overlapStep = 22; // Pixeles de solapamiento entre capas (colapsado)
          const expandedStep = 55; // Pixeles de separación (expandido)
          const totalIngredients = productIngredients.length;
          // 1. Calculamos posiciones base desde abajo
          const bottomValueCollapsed = (totalIngredients - 1 - index) * overlapStep;
          const bottomValueExpanded = (totalIngredients - 1 - index) * expandedStep;
          // 2. Calculamos cuánto crece en total para distribuir la expansión (mitad arriba, mitad abajo)
          const totalGrowth = (totalIngredients - 1) * (expandedStep - overlapStep);
          const centerOffset = totalGrowth / 2; 
          // 3. Aplicamos el desplazamiento matemático (animando el eje Y)
          const yCollapsed = -bottomValueCollapsed;
          const yExpanded = -bottomValueExpanded + centerOffset;

          // Renderizar imagen si existe
          if (ingredient.image) {
            return (
              <motion.img
                key={`${product.id}-${ingredient.id}`}
                src={ingredient.image}
                alt={ingredient.name}
                className="absolute w-40 h-auto"
                style={{ 
                  zIndex,
                  bottom: 0,
                  willChange: 'transform',
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))'
                }}
                animate={{
                  y: isCollapsed ? yCollapsed : yExpanded,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            );
          }

          // Fallback: componente 3D si existe para ese tipo
          const FallbackComponent = fallbackComponents[ingredient.type];
          if (FallbackComponent) {
            // Caso especial para carne con animación de slide
            if (ingredient.type === 'meat') {
              if (!selectedMeat) {
                return (
                  <div key={`${product.id}-${ingredient.id}`} className="absolute w-full flex justify-center text-gray-400" style={{zIndex, bottom: 0}}>
                    Sin carne seleccionada
                  </div>
                );
              }
              return (
                <motion.div
                  key={`${product.id}-${ingredient.id}`}
                  className="absolute w-full flex justify-center"
                  style={{ 
                    zIndex,
                    bottom: 0,
                    willChange: 'transform'
                  }}
                  animate={{
                    y: isCollapsed ? yCollapsed : yExpanded,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <AnimatePresence mode="wait">
                    <Meat
                      key={selectedMeat.id}
                      id={selectedMeat.id}
                      style={selectedMeat.style}
                      direction={direction}
                      isCollapsed={isCollapsed}
                      imageUrl={selectedMeat.image}
                    />
                  </AnimatePresence>
                </motion.div>
              );
            }

            // Otros ingredientes con fallback 3D
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
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <FallbackComponent isCollapsed={isCollapsed} />
              </motion.div>
            );
          }

          return null;
        })}
      </div>
    </motion.div>
  );
};
