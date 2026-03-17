import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Category } from '../../types';
import { ImageUploader } from './ImageUploader';

export const CategoryEditor = () => {
  const { categories, updateCategory, addCategory, deleteCategory } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData(category);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: `category-${Date.now()}`,
      name: '',
      description: '',
      enabled: true,
      order: categories.length + 1,
      isMain: false,
    });
  };

  const handleSave = () => {
    if (isAdding && formData.id) {
      addCategory(formData as Category);
      setIsAdding(false);
    } else if (editingId && formData) {
      updateCategory(editingId, formData);
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
    if (confirm('¿Estás seguro de eliminar esta categoría? Todos los productos asociados también se eliminarán.')) {
      deleteCategory(id);
    }
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateCategory(id, { enabled: !enabled });
  };

  const moveCategory = (id: string, direction: 'up' | 'down') => {
    const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
    const index = sortedCategories.findIndex(cat => cat.id === id);
    
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < sortedCategories.length - 1)) {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const currentOrder = sortedCategories[index].order;
      const targetOrder = sortedCategories[targetIndex].order;
      
      updateCategory(sortedCategories[index].id, { order: targetOrder });
      updateCategory(sortedCategories[targetIndex].id, { order: currentOrder });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestión de Categorías</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Categoría
        </button>
      </div>

      {/* ✨ NUEVO: Banner Guía para la Categoría Principal ✨ */}
      {!isAdding && !editingId && (
        <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/10 border border-purple-500/30 p-4 rounded-xl flex items-start gap-4">
          <div className="text-2xl bg-purple-500/20 p-2 rounded-lg">🌟</div>
          <div>
            <h4 className="text-purple-400 font-bold mb-1">¿Qué es la Categoría Principal?</h4>
            <p className="text-sm text-purple-100/80 leading-relaxed">
              La <strong>Categoría Principal</strong> es la primera que ven tus clientes al abrir el menú y recibe un diseño visual más grande y destacado.<br/>
              Aquí suelen ir tus productos estrella (ej: Hamburguesas).<br/>
              <strong>Importante:</strong> El <strong>Modo 3D</strong> puede usarse en cualquier categoría si activas las capas en los productos, pero solo la principal tendrá el efecto visual gigante y destacado.
            </p>
          </div>
        </div>
      )}

      {/* Form for Adding/Editing */}
      {(isAdding || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {isAdding ? 'Nueva Categoría' : 'Editar Categoría'}
            </h3>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej: Hamburguesas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Icono (Emoji)</label>
              <input
                type="text"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="🍔"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Descripción de la categoría..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-3 pt-4 border-t border-gray-700/50 mt-2">
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled || false}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-300">Categoría Visible al público</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-orange-500/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isMain || false}
                    onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-bold text-orange-400">🌟 Hacer Categoría Principal</span>
                </label>
              </div>

              {/* ✨ NUEVO: Explicación dinámica al marcar la casilla ✨ */}
              {formData.isMain && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3 mt-1">
                  <span className="text-orange-400 mt-0.5">ℹ️</span>
                  <p className="text-xs text-orange-200/90 leading-relaxed">
                    Al guardar, cualquier otra categoría principal perderá su corona. Los productos dentro de esta categoría dominarán la pantalla inicial del cliente y activarán el <strong>Modo 3D</strong> (si lo tienen configurado).
                  </p>
                </div>
              )}
            </div>
          </div>

          <ImageUploader
            currentImage={formData.image}
            onImageChange={(url) => setFormData({ ...formData, image: url })}
            label="Imagen de la Categoría"
          />
        </motion.div>
      )}

      {/* List of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.sort((a, b) => a.order - b.order).map((category, index) => (
          <motion.div
            key={category.id}
            layout
            className={`bg-gray-800 rounded-xl p-4 border transition-all ${
              category.enabled 
                ? 'border-gray-700 hover:border-orange-500/50' 
                : 'border-gray-700 opacity-50'
            }`}
          >
            {category.image && (
              <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-700">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {category.icon && <span className="text-2xl">{category.icon}</span>}
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                </div>
                {category.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{category.description}</p>
                )}
              </div>
              <button
                onClick={() => toggleEnabled(category.id, category.enabled)}
                className={`p-1 rounded transition-colors ${
                  category.enabled ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                {category.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-1">
                <button
                  onClick={() => moveCategory(category.id, 'up')}
                  disabled={index === 0}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => moveCategory(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <button
                onClick={() => startEdit(category)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
