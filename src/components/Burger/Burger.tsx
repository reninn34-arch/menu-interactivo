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
}

export const Burger = ({ isCollapsed, product, selectedMeat, direction }: BurgerProps) => {
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

          // Renderizar imagen si existe
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

          // Fallback: componente 3D si existe para ese tipo
          const FallbackComponent = fallbackComponents[ingredient.type];
          if (FallbackComponent) {
            // Caso especial para carne con animación de slide
            if (ingredient.type === 'meat') {
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
                className="relative"
                style={{ zIndex }}
                animate={{
                  y: translateY,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <FallbackComponent isCollapsed={isCollapsed} />
              </motion.div>
            );
          }

          return null;
        })}
      </motion.div>
    </motion.div>
  );
};
