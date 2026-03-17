import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Product } from '../../types';
import { ImageUploader } from './ImageUploader';

export const ProductEditor = () => {
  const { products, categories, ingredients, optionGroups, updateProduct, addProduct, deleteProduct } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    const defaultCategory = categories.find(cat => cat.enabled);
    setFormData({
      id: `product-${Date.now()}`,
      categoryId: defaultCategory?.id || categories[0]?.id || '',
      name: '',
      description: '',
      price: 0,
      enabled: true,
      featured: false,
      order: products.length + 1,
      ingredientIds: [],
      optionGroupIds: [],
    });
  };

  const handleSave = () => {
    // Validaciones básicas
    if (!formData.name?.trim()) {
      alert('⚠️ El producto debe tener un nombre.');
      return;
    }
    if (!formData.categoryId) {
      alert('⚠️ El producto debe pertenecer a una categoría. Por favor crea una primero.');
      return;
    }
    if (formData.price === undefined || formData.price < 0) {
      alert('⚠️ El producto debe tener un precio válido (mayor o igual a 0).');
      return;
    }

    // Validar vista por capas si está activada
    if (formData.useLayeredView) {
      if (!formData.variableIngredientId || !formData.linkedOptionGroupId) {
        alert('⚠️ Para usar la vista por capas debes seleccionar un Ingrediente Variable y un Grupo de Opciones Vinculado.');
        return;
      }
    }

    // Guardar
    if (isAdding && formData.id) {
      addProduct(formData as Product);
      setIsAdding(false);
    } else if (editingId && formData) {
      updateProduct(editingId, formData);
      setEditingId(null);
    }
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateProduct(id, { enabled: !enabled });
  };

  const toggleFeatured = (id: string, featured: boolean) => {
    updateProduct(id, { featured: !featured });
  };

  const moveProduct = (id: string, direction: 'up' | 'down') => {
    const sortedProducts = [...products].sort((a, b) => a.order - b.order);
    const index = sortedProducts.findIndex(prod => prod.id === id);
    
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < sortedProducts.length - 1)) {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const currentOrder = sortedProducts[index].order;
      const targetOrder = sortedProducts[targetIndex].order;
      
      updateProduct(sortedProducts[index].id, { order: targetOrder });
      updateProduct(sortedProducts[targetIndex].id, { order: currentOrder });
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategory);

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Sin categoría';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestión de Productos</h2>
        <div className="relative">
          <button
            onClick={startAdd}
            disabled={categories.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            Agregar Producto
          </button>
          {categories.length === 0 && (
            <p className="text-xs text-red-400 mt-1 absolute right-0 top-full whitespace-nowrap">
              ⚠️ Crea una categoría primero
            </p>
          )}
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todas
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Form for Adding/Editing */}
      {(isAdding || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {isAdding ? 'Nuevo Producto' : 'Editar Producto'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">Los campos con * son obligatorios</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría*</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre*</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej: Cheeseburger Deluxe"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Descripción del producto..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio*</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price ?? 0}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Orden</label>
              <input
                type="number"
                min="1"
                value={formData.order ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, order: isNaN(val) ? 0 : val });
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* ✨ NUEVO: Disponibilidad */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tiempo de Preparación (minutos)
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimatedTime ?? ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, estimatedTime: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) });
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej: 15"
              />
            </div>
          </div>

          {/* ✨ NUEVO: Control de disponibilidad */}
          <div className="flex items-center gap-6 p-4 bg-gray-700 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock !== false} // Por defecto true
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">
                ✅ Producto en stock (disponible para ordenar)
              </span>
            </label>
            {formData.inStock === false && (
              <span className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                ⚠️ Los clientes no podrán ordenar este producto
              </span>
            )}
          </div>

          {/* Información Nutricional (Opcional) */}
          <details className="bg-gray-700 p-4 rounded-lg">
            <summary className="text-gray-300 cursor-pointer font-medium mb-2">Información Nutricional (Opcional)</summary>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Calorías</label>
                <input
                  type="number"
                  value={formData.calories ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, calories: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) });
                  }}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="kcal"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Proteína</label>
                <input
                  type="number"
                  value={formData.protein ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, protein: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) });
                  }}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="g"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Grasa</label>
                <input
                  type="number"
                  value={formData.fat ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, fat: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) });
                  }}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="g"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Carbohidratos</label>
                <input
                  type="number"
                  value={formData.carbs ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, carbs: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) });
                  }}
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="g"
                  min="0"
                />
              </div>
            </div>
          </details>

          {/* Selección de Ingredientes */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-gray-300 font-medium mb-3">Ingredientes del Producto</h4>
            <p className="text-sm text-gray-400 mb-3">Selecciona los ingredientes que incluye este producto</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {ingredients
                .filter(ing => ing.enabled)
                .sort((a, b) => a.order - b.order)
                .map(ingredient => {
                  const isSelected = formData.ingredientIds?.includes(ingredient.id) || false;
                  return (
                    <label
                      key={ingredient.id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-orange-500/20 border border-orange-500' 
                          : 'bg-gray-600 border border-gray-500 hover:bg-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentIds = formData.ingredientIds || [];
                          const newIds = e.target.checked
                            ? [...currentIds, ingredient.id]
                            : currentIds.filter(id => id !== ingredient.id);
                          setFormData({ ...formData, ingredientIds: newIds });
                        }}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm text-white">{ingredient.name}</span>
                    </label>
                  );
                })}
            </div>
            {ingredients.filter(ing => ing.enabled).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay ingredientes disponibles. Créalos en la pestaña "Ingredientes".
              </p>
            )}
          </div>

          {/* Selección de Grupos de Opciones */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="text-gray-300 font-medium mb-3">Grupos de Opciones</h4>
            <p className="text-sm text-gray-400 mb-3">
              Selecciona qué grupos de opciones (tamaños, extras, complementos) puede elegir el cliente
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {optionGroups
                .filter(group => group.enabled)
                .sort((a, b) => a.order - b.order)
                .map(group => {
                  const isSelected = formData.optionGroupIds?.includes(group.id) || false;
                  return (
                    <label
                      key={group.id}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-orange-500/20 border border-orange-500' 
                          : 'bg-gray-600 border border-gray-500 hover:bg-gray-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentIds = formData.optionGroupIds || [];
                          const newIds = e.target.checked
                            ? [...currentIds, group.id]
                            : currentIds.filter(id => id !== group.id);
                          setFormData({ ...formData, optionGroupIds: newIds });
                        }}
                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-white block">{group.name}</span>
                        {group.description && (
                          <span className="text-xs text-gray-400">{group.description}</span>
                        )}
                      </div>
                      {group.required && (
                        <span className="px-2 py-0.5 text-xs bg-orange-500/30 text-orange-300 rounded">
                          Obligatorio
                        </span>
                      )}
                    </label>
                  );
                })}
            </div>
            {optionGroups.filter(group => group.enabled).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay grupos de opciones disponibles. Créalos en la pestaña "Opciones".
              </p>
            )}
          </div>

          {/* ✨ NUEVO: Interfaz Intuitiva para Modo 3D ✨ */}
          <div className={`p-5 rounded-xl border-2 transition-all ${formData.useLayeredView ? 'bg-orange-900/20 border-orange-500' : 'bg-gray-800 border-gray-600'}`}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-2">
              <div className={`p-3 rounded-xl shadow-lg ${formData.useLayeredView ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gray-700'}`}>
                <span className="text-3xl">🍔</span>
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={formData.useLayeredView || false}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      useLayeredView: e.target.checked,
                      variableIngredientId: e.target.checked ? formData.variableIngredientId : undefined,
                      linkedOptionGroupId: e.target.checked ? formData.linkedOptionGroupId : undefined
                    })}
                    className="w-6 h-6 rounded border-2 border-gray-500 bg-gray-700 checked:bg-orange-500 checked:border-orange-500 focus:ring-orange-500 transition-all cursor-pointer"
                  />
                  <span className="text-xl font-bold text-white">Activar Modo 3D Interactivo</span>
                </label>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Permite a tus clientes ver cómo se arma el producto capa por capa en tiempo real al cambiar sus opciones (Ej: Ver cómo cambia la carne por un pollo crujiente).
                </p>
                {/* ✨ NUEVO: Checklist de Requisitos para 3D ✨ */}
                {formData.useLayeredView && (
                  <div className="mb-4 p-4 bg-gray-900/80 rounded-xl border border-gray-700">
                    <h5 className="font-bold text-white mb-3">Para que el producto 3D funcione, necesitas cumplir esto:</h5>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-3">
                        <div className={`mt-0.5 ${formData.ingredientIds && formData.ingredientIds.length > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formData.ingredientIds && formData.ingredientIds.length > 0 ? '✅' : '❌'}
                        </div>
                        <div>
                          <span className={formData.ingredientIds && formData.ingredientIds.length > 0 ? 'text-gray-300' : 'text-red-400 font-bold'}>
                            Tener ingredientes seleccionados en este producto.
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">Ve a la sección superior y marca los ingredientes que componen esta hamburguesa.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className={`mt-0.5 ${optionGroups.length > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {optionGroups.length > 0 ? '✅' : '❌'}
                        </div>
                        <div>
                          <span className={optionGroups.length > 0 ? 'text-gray-300' : 'text-red-400 font-bold'}>
                            Haber creado al menos un Grupo de Opciones (Ej: "Tipos de Carne").
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">Si no tienes ninguno, ve a la pestaña "Opciones" en el menú principal para crearlo.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {formData.useLayeredView && (
              <div className="mt-6 space-y-6 bg-gray-900/50 p-4 sm:p-6 rounded-xl border border-gray-700">
                {/* PASO 1 */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/30">1</div>
                    <h4 className="text-white font-semibold text-lg">¿Qué ingrediente va a ser reemplazado?</h4>
                  </div>
                  <div className="pl-10">
                    <p className="text-sm text-gray-400 mb-3">
                      Selecciona la <strong>Capa Base</strong> que desaparecerá cuando el cliente elija algo diferente.
                    </p>
                    <select
                      value={formData.variableIngredientId || ''}
                      onChange={(e) => {
                        const newVarId = e.target.value || undefined;
                        let newIngredientIds = [...(formData.ingredientIds || [])];
                        // Autoselección inteligente: agregamos el ingrediente si no estaba marcado arriba
                        if (newVarId && !newIngredientIds.includes(newVarId)) {
                          newIngredientIds.push(newVarId);
                        }
                        setFormData({ 
                          ...formData, 
                          variableIngredientId: newVarId,
                          ingredientIds: newIngredientIds
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                    >
                      <option value="">-- Selecciona la capa que cambiará (Ej: Carne) --</option>
                      {ingredients.filter(ing => ing.enabled).map(ingredient => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} {formData.ingredientIds?.includes(ingredient.id) ? '✓' : '(Se añadirá a la receta)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CONECTOR VISUAL */}
                <div className="w-1 h-8 bg-gray-700 ml-6 rounded-full"></div>

                {/* PASO 2 */}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-green-500/30">2</div>
                    <h4 className="text-white font-semibold text-lg">¿Qué opciones elegirán los clientes?</h4>
                  </div>
                  <div className="pl-10">
                    <p className="text-sm text-gray-400 mb-3">
                      Selecciona el <strong>Grupo de Opciones</strong> que contiene las alternativas (estas deben tener imágenes o colores configurados).
                    </p>
                    <select
                      value={formData.linkedOptionGroupId || ''}
                      onChange={(e) => {
                        const newGroupId = e.target.value || undefined;
                        let newGroupIds = [...(formData.optionGroupIds || [])];
                        // Autoselección inteligente
                        if (newGroupId && !newGroupIds.includes(newGroupId)) {
                          newGroupIds.push(newGroupId);
                        }
                        setFormData({ 
                          ...formData, 
                          linkedOptionGroupId: newGroupId,
                          optionGroupIds: newGroupIds
                        });
                      }}
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all outline-none"
                    >
                      <option value="">-- Selecciona el grupo (Ej: Tipos de Carne) --</option>
                      {optionGroups.filter(group => group.enabled).map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name} {formData.optionGroupIds?.includes(group.id) ? '✓' : '(Se habilitará para el producto)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* MENSAJE DE ÉXITO EXPLICATIVO */}
                {formData.variableIngredientId && formData.linkedOptionGroupId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl flex items-start gap-4"
                  >
                    <div className="p-2 bg-green-500/20 rounded-lg mt-1">
                      <span className="text-xl">✨</span>
                    </div>
                    <div>
                      <h5 className="text-green-400 font-bold mb-1">¡Configuración 3D Lista!</h5>
                      <p className="text-sm text-green-200/80 leading-relaxed">
                        Cuando el cliente seleccione una opción de <strong>"{optionGroups.find(g => g.id === formData.linkedOptionGroupId)?.name}"</strong>, 
                        la vista 3D apartará las capas y reemplazará <strong>"{ingredients.find(i => i.id === formData.variableIngredientId)?.name}"</strong> por el nuevo ingrediente elegido.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled || false}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">Habilitado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">Destacado</span>
            </label>
          </div>

          <ImageUploader
            currentImage={formData.image}
            onImageChange={(url) => setFormData({ ...formData, image: url })}
            label="Imagen del Producto"
          />
        </motion.div>
      )}

      {/* List of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.sort((a, b) => a.order - b.order).map((product, index) => (
          <motion.div
            key={product.id}
            layout
            className={`bg-gray-800 rounded-xl p-4 border transition-all ${
              product.enabled 
                ? 'border-gray-700 hover:border-orange-500/50' 
                : 'border-gray-700 opacity-50'
            }`}
          >
            {product.image && (
              <div className="w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-700 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.featured && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white p-1 rounded-full">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-xs text-orange-500 mb-1">{getCategoryName(product.categoryId)}</p>
                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mt-1">{product.description}</p>
                )}
                <p className="text-xl font-bold text-orange-500 mt-2">${product.price.toFixed(2)}</p>
                {product.ingredientIds && product.ingredientIds.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-1">Ingredientes:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.ingredientIds.slice(0, 4).map(ingId => {
                        const ingredient = ingredients.find(ing => ing.id === ingId);
                        return ingredient ? (
                          <span key={ingId} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            {ingredient.name}
                          </span>
                        ) : null;
                      })}
                      {product.ingredientIds.length > 4 && (
                        <span className="text-xs text-gray-500">+{product.ingredientIds.length - 4} más</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => toggleEnabled(product.id, product.enabled)}
                className={`p-2 rounded transition-colors ${
                  product.enabled ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-500'
                }`}
              >
                {product.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => toggleFeatured(product.id, product.featured || false)}
                className={`p-2 rounded transition-colors ${
                  product.featured ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-700 text-gray-400'
                }`}
              >
                <Star className={`w-4 h-4 ${product.featured ? 'fill-current' : ''}`} />
              </button>
              
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => moveProduct(product.id, 'up')}
                  disabled={index === 0}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => moveProduct(product.id, 'down')}
                  disabled={index === filteredProducts.length - 1}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <button
                onClick={() => startEdit(product)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No hay productos en esta categoría</p>
        </div>
      )}
    </div>
  );
};
