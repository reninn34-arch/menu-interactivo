import { motion, AnimatePresence } from 'motion/react';
import { useMenu } from '../contexts/MenuContext';
import { Product } from '../types';
import { TopBun, Cheese, Meat, Tomato, Lettuce, BottomBun } from './Burger';

interface LayeredProductViewProps {
  isCollapsed: boolean;
  product: Product;
  selectedOptions: Record<string, string>; // groupId -> optionValueId
  direction: number;
  shouldAnimate?: boolean;
}

// Tipo unificado para todas las capas (estáticas o dinámicas)
interface UnifiedLayer {
  id: string;
  key: string;       // Clave única para React + AnimatePresence
  isDynamic: boolean;
  order: number;
  name: string;
  type: string;
  image?: string;
  style?: string;
  groupId?: string;  // Solo para capas dinámicas
}

export const LayeredProductView = ({ 
  isCollapsed, 
  product, 
  selectedOptions,
  direction,
  shouldAnimate = true
}: LayeredProductViewProps) => {
  const { ingredients, optionGroups } = useMenu();

  // Componentes 3D fallback por tipo de ingrediente
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
    'custom': 15,
  };

  // ─── 1. Capas Estáticas (Ingredientes) ───────────────────────────────────
  const staticLayers: UnifiedLayer[] = product.ingredientIds
    ? ingredients
        .filter(ing => product.ingredientIds!.includes(ing.id) && ing.enabled)
        .map(ing => ({
          id: ing.id,
          key: `static-${ing.id}`,
          isDynamic: false,
          order: ing.order,
          name: ing.name,
          type: ing.type,
          image: ing.image,
          style: undefined,
        }))
    : [];

  // ─── 2. Capas Dinámicas (Grupos de Opciones marcados como 3D) ────────────
  const dynamicLayers: UnifiedLayer[] = product.optionGroupIds
    ? optionGroups
        .filter(g => product.optionGroupIds!.includes(g.id) && g.enabled && g.is3DLayer)
        .map(group => {
          const selectedValueId = selectedOptions[group.id];
          const selectedValue =
            group.values.find(v => v.id === selectedValueId && v.enabled) ||
            group.values.find(v => v.enabled);

          return {
            id: group.id,
            key: `dynamic-${group.id}-${selectedValueId || 'default'}`,
            isDynamic: true,
            order: group.layerOrder ?? 5,
            name: selectedValue?.name || group.name,
            type: 'meat', // Tipo fallback para componentes 3D
            image: selectedValue?.image,
            style: selectedValue?.style,
            groupId: group.id,
          };
        })
    : [];

  // ─── 3. RETROCOMPATIBILIDAD: Soporte para el sistema antiguo ─────────────
  // Si el producto usa el mecanismo antiguo (variableIngredientId + linkedOptionGroupId)
  // y no hay capas dinámicas nuevas, convertimos el viejo sistema al nuevo.
  let legacyDynamicLayer: UnifiedLayer | null = null;
  if (dynamicLayers.length === 0 && product.variableIngredientId && product.linkedOptionGroupId) {
    const linkedGroup = optionGroups.find(g => g.id === product.linkedOptionGroupId);
    const variableIngredient = ingredients.find(i => i.id === product.variableIngredientId);
    if (linkedGroup && variableIngredient) {
      const selectedValueId = selectedOptions[linkedGroup.id];
      const selectedValue =
        linkedGroup.values.find(v => v.id === selectedValueId && v.enabled) ||
        linkedGroup.values.find(v => v.enabled);

      legacyDynamicLayer = {
        id: `legacy-${variableIngredient.id}`,
        key: `legacy-${variableIngredient.id}-${selectedValueId || 'default'}`,
        isDynamic: true,
        order: variableIngredient.order,
        name: selectedValue?.name || variableIngredient.name,
        type: variableIngredient.type,
        image: selectedValue?.image || variableIngredient.image,
        style: selectedValue?.style,
        groupId: linkedGroup.id,
      };
    }
  }

  // ─── 4. Mezclar y ordenar todas las capas ────────────────────────────────
  const allLayers: UnifiedLayer[] = [
    // Filtrar el ingrediente variable base SIEMPRE (para que no aparezca el ancla vieja como un bloque gris detrás)
    ...staticLayers.filter(l => !product.variableIngredientId || l.id !== product.variableIngredientId),
    ...(dynamicLayers.length > 0 ? dynamicLayers : legacyDynamicLayer ? [legacyDynamicLayer] : []),
  ].sort((a, b) => a.order - b.order);

  const totalLayers = allLayers.length;
  const overlapStep = 22;
  const expandedStep = totalLayers > 6 ? 50 : 55;

  return (
    <motion.div 
      style={{ willChange: 'transform' }}
      animate={shouldAnimate ? { 
        y: isCollapsed ? [0, -5, 0] : [0, -8, 0],
      } : { y: 0 }}
      transition={{ 
        duration: isCollapsed ? 2 : 4, 
        repeat: shouldAnimate ? Infinity : 0, 
        ease: "easeInOut" 
      }}
      className="scale-100 sm:scale-110 lg:scale-125" 
    >
      <div className="relative w-72 h-96 mx-auto flex items-end justify-center">
        {allLayers.map((layer, index) => {
          const zIndex = 50 - index;
          const bottomValueCollapsed = (totalLayers - 1 - index) * overlapStep;
          const bottomValueExpanded = (totalLayers - 1 - index) * expandedStep;
          const totalGrowth = (totalLayers - 1) * (expandedStep - overlapStep);
          const centerOffset = totalGrowth / 2;
          const yCollapsed = -bottomValueCollapsed;
          const yExpanded = -bottomValueExpanded + centerOffset;

          // ── Capa DINÁMICA ──────────────────────────────────────────────────
          if (layer.isDynamic) {
            return (
              <motion.div
                key={`${product.id}-${layer.id}`}
                className="absolute w-full flex justify-center"
                style={{ zIndex, bottom: 0, willChange: 'transform' }}
                animate={{ y: isCollapsed ? yCollapsed : yExpanded }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <AnimatePresence mode="wait">
                  {layer.image ? (
                    <motion.img
                      key={layer.key}
                      src={layer.image}
                      alt={layer.name}
                      className="w-56 h-auto"
                      style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.25))', willChange: 'transform' }}
                      initial={{ x: direction > 0 ? 100 : -100, opacity: 0, rotateY: direction > 0 ? 45 : -45 }}
                      animate={{ x: 0, opacity: 1, rotateY: 0 }}
                      exit={{ x: direction > 0 ? -100 : 100, opacity: 0, rotateY: direction > 0 ? -45 : 45 }}
                      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    />
                  ) : layer.type === 'meat' ? (
                    <Meat
                      key={layer.key}
                      id={layer.key}
                      style={layer.style || 'bg-gray-500'}
                      direction={direction}
                      isCollapsed={isCollapsed}
                    />
                  ) : (
                    <motion.div
                      key={layer.key}
                      className={`w-56 h-28 rounded-full ${layer.style || 'bg-gray-500'}`}
                      initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          }

          // ── Capa ESTÁTICA ─────────────────────────────────────────────────
          if (layer.image) {
            return (
              <motion.img
                key={`${product.id}-${layer.id}`}
                src={layer.image}
                alt={layer.name}
                className="absolute w-56 h-auto"
                style={{ zIndex, bottom: 0, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.25))', willChange: 'transform' }}
                animate={{ y: isCollapsed ? yCollapsed : yExpanded }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              />
            );
          }

          // Fallback: componente 3D si existe para ese tipo
          const FallbackComponent = fallbackComponents[layer.type];
          if (FallbackComponent) {
            return (
              <motion.div
                key={`${product.id}-${layer.id}`}
                className="absolute"
                style={{ zIndex, bottom: 0, willChange: 'transform' }}
                animate={{ y: isCollapsed ? yCollapsed : yExpanded }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
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
