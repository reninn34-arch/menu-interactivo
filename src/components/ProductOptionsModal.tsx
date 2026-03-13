import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, ProductOptionGroup, SelectedOption } from '../types';
import { useMenu } from '../contexts/MenuContext';

interface ProductOptionsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: SelectedOption[], notes?: string) => void;
  excludedGroupIds?: string[]; // Permite ocultar grupos específicos
  basePriceOverride?: number;  // Ajusta el precio base si es necesario
}

export const ProductOptionsModal = ({ product, isOpen, onClose, onConfirm, excludedGroupIds = [], basePriceOverride }: ProductOptionsModalProps) => {
  const { optionGroups, siteConfig } = useMenu();
  const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map());
  const [notes, setNotes] = useState<string>('');

  // Filtrar grupos de opciones excluyendo los que no queremos mostrar
  const productOptionGroups = optionGroups.filter(
    group => product.optionGroupIds?.includes(group.id) && group.enabled && !excludedGroupIds.includes(group.id)
  );

  // Inicializar selecciones con valores por defecto
  useEffect(() => {
    if (isOpen) {
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
      setNotes('');
    }
  }, [isOpen, product.id]);

  const handleOptionToggle = (groupId: string, valueId: string, multiSelect: boolean) => {
    setSelections(prev => {
      const newSelections = new Map(prev);
      const existingSet = newSelections.get(groupId) as Set<string> | undefined;
      const currentSet = new Set<string>(existingSet ? Array.from(existingSet) : []);

      if (multiSelect) {
        // Toggle para multi-select
        if (currentSet.has(valueId)) {
          currentSet.delete(valueId);
        } else {
          // Verificar límite de selecciones máximas
          const group = optionGroups.find(g => g.id === groupId);
          if (group && group.maxSelections && currentSet.size >= group.maxSelections) {
            return prev; // Ignorar si ya se alcanzó el máximo
          }
          currentSet.add(valueId);
        }
        newSelections.set(groupId, currentSet);
      } else {
        // Replace para single-select
        newSelections.set(groupId, new Set([valueId]));
      }

      return newSelections;
    });
  };

  const calculateTotal = () => {
    // Usar precio base sobreescrito si existe
    let total = basePriceOverride !== undefined ? basePriceOverride : product.price;
    
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

      // A required group must have at least 1 selection
      if (group.required && count === 0) return false;
      // minSelections only enforced if group is required or user already started selecting
      if (group.minSelections && count > 0 && count < group.minSelections) return false;
      if (group.maxSelections && count > group.maxSelections) return false;

      return true;
    });
  };

  const handleConfirm = () => {
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

    onConfirm(selectedOptions, notes || undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#2A1810] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="sticky top-0 bg-[#2A1810] border-b p-6 z-10"
            style={{ borderColor: `${siteConfig.primaryColor || '#FF9F0A'}33` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
                <p className="text-gray-400 text-sm">{product.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="p-6 space-y-6">
            {productOptionGroups.map(group => {
              const selected = selections.get(group.id) || new Set();
              
              return (
                <div key={group.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {group.name}
                      {group.required && (
                        <span className="ml-1" style={{ color: siteConfig.primaryColor || '#FF9F0A' }}>
                          *
                        </span>
                      )}
                    </h3>
                    {group.multiSelect && group.maxSelections && (
                      <span className="text-sm text-gray-400">
                        {selected.size}/{group.maxSelections}
                      </span>
                    )}
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-gray-400">{group.description}</p>
                  )}

                  <div className="space-y-2">
                    {group.values.filter(v => v.enabled).map(value => {
                      const isSelected = selected.has(value.id);
                      
                      return (
                        <button
                          key={value.id}
                          onClick={() => handleOptionToggle(group.id, value.id, group.multiSelect)}
                          className="w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all"
                          style={isSelected ? {
                            borderColor: siteConfig.primaryColor || '#FF9F0A',
                            backgroundColor: `${siteConfig.primaryColor || '#FF9F0A'}1A`
                          } : {
                            borderColor: '#374151'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                              style={isSelected ? {
                                borderColor: siteConfig.primaryColor || '#FF9F0A',
                                backgroundColor: siteConfig.primaryColor || '#FF9F0A'
                              } : {
                                borderColor: '#4B5563'
                              }}
                            >
                              {isSelected && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-white font-medium">{value.name}</span>
                          </div>
                          {value.priceModifier !== 0 && (
                            <span 
                              className="text-sm font-semibold"
                              style={{ 
                                color: value.priceModifier > 0 
                                  ? (siteConfig.accentColor || '#FFB84D')
                                  : '#4ADE80'
                              }}
                            >
                              {value.priceModifier > 0 ? '+' : ''}${value.priceModifier.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div 
            className="sticky bottom-0 bg-[#2A1810] border-t p-6"
            style={{ borderColor: `${siteConfig.primaryColor || '#FF9F0A'}33` }}
          >
            <button
              onClick={handleConfirm}
              disabled={!isValid()}
              className="w-full py-4 rounded-xl font-bold text-lg transition-all"
              style={
                isValid()
                  ? {
                      background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                      color: '#FFFFFF',
                      boxShadow: `0 10px 25px -5px ${siteConfig.primaryColor || '#FF9F0A'}80`
                    }
                  : {
                      backgroundColor: '#374151',
                      color: '#6B7280',
                      cursor: 'not-allowed'
                    }
              }
              onMouseEnter={(e) => {
                if (isValid()) {
                  e.currentTarget.style.boxShadow = `0 20px 35px -5px ${siteConfig.primaryColor || '#FF9F0A'}B3`;
                }
              }}
              onMouseLeave={(e) => {
                if (isValid()) {
                  e.currentTarget.style.boxShadow = `0 10px 25px -5px ${siteConfig.primaryColor || '#FF9F0A'}80`;
                }
              }}
            >
              Agregar al Carrito - ${calculateTotal().toFixed(2)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
