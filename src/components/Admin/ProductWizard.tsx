import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Package, 
  Salad, 
  Sliders, 
  Eye,
  Plus,
  X,
  ChevronDown,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Product } from '../../types';
import { Layer3DPreview } from './Layer3DPreview';

interface ProductWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

export const ProductWizard = ({ isOpen, onClose }: ProductWizardProps) => {
  const { products, categories, ingredients, optionGroups, addProduct, siteConfig } = useMenu();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    id: `product-${Date.now()}`,
    categoryId: categories.find(c => c.enabled)?.id || '',
    name: '',
    description: '',
    price: 0,
    enabled: true,
    featured: false,
    order: products.length + 1,
    ingredientIds: [],
    optionGroupIds: [],
    useLayeredView: false,
    inStock: true,
  });

  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [previewRotation, setPreviewRotation] = useState(0);

  const steps = [
    { number: 1, label: 'Datos Básicos', icon: Package },
    { number: 2, label: 'Ingredientes', icon: Salad },
    { number: 3, label: 'Opciones', icon: Sliders },
    { number: 4, label: 'Vista Previa', icon: Eye },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name?.trim() && formData.categoryId && formData.price !== undefined;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => (prev + 1) as WizardStep);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as WizardStep);
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert('El producto debe tener un nombre');
      return;
    }
    if (!formData.categoryId) {
      alert('Selecciona una categoría');
      return;
    }

    await addProduct(formData as Product);
    onClose();
    setFormData({
      id: `product-${Date.now()}`,
      categoryId: categories.find(c => c.enabled)?.id || '',
      name: '',
      description: '',
      price: 0,
      enabled: true,
      featured: false,
      order: products.length + 1,
      ingredientIds: [],
      optionGroupIds: [],
      useLayeredView: false,
      inStock: true,
    });
    setCurrentStep(1);
  };

  const toggleIngredient = (ingId: string) => {
    const current = formData.ingredientIds || [];
    const newIds = current.includes(ingId)
      ? current.filter(id => id !== ingId)
      : [...current, ingId];
    setFormData({ ...formData, ingredientIds: newIds });
  };

  const toggleOption = (optId: string) => {
    const current = formData.optionGroupIds || [];
    const newIds = current.includes(optId)
      ? current.filter(id => id !== optId)
      : [...current, optId];
    setFormData({ ...formData, optionGroupIds: newIds });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-hidden"
    >
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                Crear Nuevo Producto
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Guía paso a paso para crear un producto con opciones 3D
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <button
                    onClick={() => step.number < currentStep && setCurrentStep(step.number as WizardStep)}
                    disabled={step.number > currentStep}
                    className={`flex flex-col items-center gap-2 transition-all ${
                      step.number > currentStep ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                      isCompleted 
                        ? 'bg-green-500 text-white'
                        : isActive 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-medium ${isActive ? 'text-orange-400' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`w-16 sm:w-24 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Data */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Datos del Producto</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Categoría <span className="text-orange-500">*</span>
                        </label>
                        <select
                          value={formData.categoryId || ''}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="">Selecciona categoría</option>
                          {categories.filter(c => c.enabled).map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                          placeholder="Ej: Hamburguesa Premium"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                          placeholder="Describe tu producto..."
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(formData.description || '').length} / 200 caracteres
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Precio <span className="text-orange-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {siteConfig.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price ?? 0}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-8 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tiempo de preparación (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.estimatedTime || ''}
                          onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || undefined })}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                          placeholder="15"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.enabled ?? true}
                          onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-300">Habilitado</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.featured ?? false}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-300">Producto destacado ⭐</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Ingredients */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Ingredientes del Producto</h3>
                      <label className="flex items-center gap-2 cursor-pointer bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-500/30">
                        <input
                          type="checkbox"
                          checked={formData.useLayeredView ?? false}
                          onChange={(e) => setFormData({ ...formData, useLayeredView: e.target.checked })}
                          className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-white font-medium">🎨 Vista 3D por Capas</span>
                      </label>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                      Selecciona los ingredientes que incluye este producto. 
                      {formData.useLayeredView && (
                        <span className="text-blue-400 ml-2">
                          Se mostrarán apilados en una animación 3D.
                        </span>
                      )}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {ingredients.filter(i => i.enabled).map(ingredient => {
                        const isSelected = formData.ingredientIds?.includes(ingredient.id) || false;
                        return (
                          <button
                            key={ingredient.id}
                            onClick={() => toggleIngredient(ingredient.id)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'bg-orange-500/20 border-orange-500'
                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            {ingredient.image ? (
                              <img 
                                src={ingredient.image} 
                                alt={ingredient.name}
                                className="w-12 h-12 mx-auto mb-2 rounded-lg object-contain"
                              />
                            ) : (
                              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-600 flex items-center justify-center">
                                <Salad className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <p className="text-white text-sm font-medium text-center">{ingredient.name}</p>
                            <p className="text-gray-500 text-xs text-center">Orden: {ingredient.order}</p>
                          </button>
                        );
                      })}
                    </div>

                    {ingredients.filter(i => i.enabled).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No hay ingredientes disponibles</p>
                        <button
                          onClick={() => {}}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          Crear Ingrediente
                        </button>
                      </div>
                    )}

                    {(formData.ingredientIds?.length || 0) > 0 && formData.useLayeredView && (
                      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                        <h4 className="text-blue-400 font-medium mb-2">Preview de Capas 3D</h4>
                        <Layer3DPreview 
                          ingredientIds={formData.ingredientIds || []}
                          optionGroupIds={formData.optionGroupIds || []}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Options */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Opciones del Producto</h3>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      Selecciona qué grupos de opciones puede elegir el cliente 
                      (tamaños, extras, tipos de carne, etc.)
                    </p>

                    <div className="space-y-3">
                      {optionGroups.filter(g => g.enabled).map(group => {
                        const isSelected = formData.optionGroupIds?.includes(group.id) || false;
                        const is3D = group.is3DLayer;
                        
                        return (
                          <button
                            key={group.id}
                            onClick={() => toggleOption(group.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                              isSelected
                                ? 'bg-orange-500/20 border-orange-500'
                                : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-orange-500' : 'bg-gray-600'
                            }`}>
                              <Sliders className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{group.name}</p>
                              <p className="text-gray-400 text-sm">{group.values.length} opciones disponibles</p>
                            </div>
                            {is3D && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                                🎨 3D
                              </span>
                            )}
                            {group.required && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                Obligatorio
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {optionGroups.filter(g => g.enabled).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No hay grupos de opciones disponibles</p>
                        <button
                          onClick={() => {}}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                        >
                          Crear Grupo de Opciones
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Preview */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-orange-500" />
                      Vista Previa del Producto
                    </h3>

                    {/* Product Card Preview */}
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Image */}
                      <div className="w-full md:w-64 h-64 rounded-2xl bg-gray-700/50 flex items-center justify-center overflow-hidden">
                        {formData.name && (
                          <div className="text-center">
                            <Package className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Vista previa de imagen</p>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <span className="text-orange-400 text-sm">
                            {categories.find(c => c.id === formData.categoryId)?.icon}{' '}
                            {categories.find(c => c.id === formData.categoryId)?.name}
                          </span>
                          <h4 className="text-2xl font-bold text-white">{formData.name}</h4>
                          {formData.description && (
                            <p className="text-gray-400 mt-2">{formData.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <span 
                            className="text-3xl font-bold"
                            style={{ color: siteConfig.primaryColor }}
                          >
                            {siteConfig.currencySymbol}{(formData.price || 0).toFixed(2)}
                          </span>
                          {formData.featured && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded">
                              ⭐ Destacado
                            </span>
                          )}
                          {!formData.enabled && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-sm rounded">
                              Deshabilitado
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {formData.useLayeredView && (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                              🎨 Vista 3D
                            </span>
                          )}
                          {(formData.ingredientIds?.length || 0) > 0 && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                              {formData.ingredientIds?.length} ingredientes
                            </span>
                          )}
                          {(formData.optionGroupIds?.length || 0) > 0 && (
                            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
                              {formData.optionGroupIds?.length} opciones
                            </span>
                          )}
                        </div>

                        {/* 3D Preview */}
                        {formData.useLayeredView && (formData.ingredientIds?.length || 0) > 0 && (
                          <div className="mt-6 p-4 bg-black/30 rounded-xl">
                            <h5 className="text-white font-medium mb-3">Preview 3D Interactivo</h5>
                            <Layer3DPreview 
                              ingredientIds={formData.ingredientIds || []}
                              optionGroupIds={formData.optionGroupIds || []}
                              interactive
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                currentStep === 1 
                ? 'opacity-50 cursor-not-allowed bg-gray-800 text-gray-500'
                : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>

            <div className="flex items-center gap-2">
              {steps.map(step => (
                <div 
                  key={step.number}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentStep === step.number 
                    ? 'bg-orange-500 scale-125'
                    : currentStep > step.number
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  !canProceed()
                  ? 'opacity-50 cursor-not-allowed bg-gray-600 text-gray-400'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                }`}
              >
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all"
              >
                <Check className="w-5 h-5" />
                Crear Producto
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};