import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useMenu } from '../../contexts/MenuContext';

interface Layer3DPreviewProps {
  ingredientIds: string[];
  optionGroupIds: string[];
  interactive?: boolean;
}

export const Layer3DPreview = ({ ingredientIds, optionGroupIds, interactive = false }: Layer3DPreviewProps) => {
  const { ingredients, optionGroups, siteConfig } = useMenu();
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (interactive && isHovered) {
      const interval = setInterval(() => {
        setRotation(prev => (prev + 2) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [interactive, isHovered]);

  const sortedIngredients = ingredients
    .filter(i => ingredientIds.includes(i.id))
    .sort((a, b) => a.order - b.order);

  const dynamic3DGroups = optionGroups.filter(
    g => g.enabled && g.is3DLayer && optionGroupIds.includes(g.id)
  );

  const selectedDynamicOption = dynamic3DGroups[0]?.values.find(v => v.enabled);

  const totalLayers = sortedIngredients.length + (selectedDynamicOption ? 1 : 0);
  
  if (totalLayers === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">No hay capas configuradas</p>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full ${interactive ? 'h-48' : 'h-32'}`}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      style={{
        perspective: '800px',
      }}
    >
      {/* 3D Container */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate(-50%, -50%) rotateY(${rotation}deg)`,
        }}
        animate={{
          rotateY: interactive && isHovered ? rotation : 0,
        }}
        transition={{
          duration: 0.1,
          ease: 'linear'
        }}
      >
        {/* Stacked Layers */}
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          {sortedIngredients.map((ingredient, index) => {
            const zIndex = totalLayers - index;
            const yOffset = index * (interactive ? 20 : 12);
            const scale = 1 - (index * (interactive ? 0.08 : 0.05));
            
            return (
              <motion.div
                key={ingredient.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  zIndex,
                  top: -yOffset,
                  transform: `translateX(-50%) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                }}
              >
                {ingredient.image ? (
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className={`${interactive ? 'w-32 h-20' : 'w-20 h-12'} object-contain drop-shadow-lg`}
                    style={{
                      filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                    }}
                  />
                ) : (
                  <div 
                    className={`${interactive ? 'w-32 h-20' : 'w-20 h-12'} rounded-lg flex items-center justify-center`}
                    style={{
                      background: `linear-gradient(135deg, ${
                        ingredient.type === 'bun-top' ? '#D4A056' :
                        ingredient.type === 'cheese' ? '#FFD700' :
                        ingredient.type === 'meat' ? '#8B4513' :
                        ingredient.type === 'tomato' ? '#FF6347' :
                        ingredient.type === 'lettuce' ? '#90EE90' :
                        '#D4A056'
                      }, ${
                        ingredient.type === 'bun-top' ? '#B8860B' :
                        ingredient.type === 'cheese' ? '#FFA500' :
                        ingredient.type === 'meat' ? '#654321' :
                        ingredient.type === 'tomato' ? '#FF4500' :
                        ingredient.type === 'lettuce' ? '#32CD32' :
                        '#B8860B'
                      })`,
                      boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <span className="text-white text-xs font-bold opacity-80">
                      {ingredient.name}
                    </span>
                  </div>
                )}
                
                {/* Layer indicator */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs ${
                  index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </motion.div>
            );
          })}

          {/* Dynamic Layer (from option group) */}
          {selectedDynamicOption && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: sortedIngredients.length * 0.1 }}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                zIndex: totalLayers + 1,
                top: -(sortedIngredients.length * (interactive ? 20 : 12)) - (interactive ? 25 : 15),
              }}
            >
              {selectedDynamicOption.image ? (
                <img
                  src={selectedDynamicOption.image}
                  alt={selectedDynamicOption.name}
                  className={`${interactive ? 'w-32 h-20' : 'w-20 h-12'} object-contain`}
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
                  }}
                />
              ) : selectedDynamicOption.style ? (
                <div 
                  className={`${interactive ? 'w-32 h-20' : 'w-20 h-12'} rounded-lg`}
                  style={{
                    background: selectedDynamicOption.style,
                    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
                  }}
                />
              ) : (
                <div 
                  className={`${interactive ? 'w-32 h-20' : 'w-20 h-12'} rounded-lg bg-gray-600`}
                />
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs bg-purple-500 text-white">
                {selectedDynamicOption.name}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Controls */}
      {interactive && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
          <span className="text-xs text-gray-500 bg-gray-800/80 px-2 py-1 rounded">
            Pasa el mouse para rotar
          </span>
        </div>
      )}

      {/* Layer info */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        {sortedIngredients.map((ing, idx) => (
          <div 
            key={ing.id}
            className="text-xs bg-black/60 text-white px-2 py-1 rounded flex items-center gap-1"
          >
            <span className="w-4 h-4 rounded bg-orange-500/30 flex items-center justify-center text-[10px]">
              {idx + 1}
            </span>
            {ing.name}
          </div>
        ))}
        {selectedDynamicOption && (
          <div className="text-xs bg-purple-900/80 text-white px-2 py-1 rounded flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-purple-500/30 flex items-center justify-center text-[10px]">
              ✦
            </span>
            {selectedDynamicOption.name}
          </div>
        )}
      </div>
    </div>
  );
};