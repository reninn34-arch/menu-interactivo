import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, GripVertical, Layers, ImageOff } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Ingredient } from '../../types';
import { ImageUploader } from './ImageUploader';
import { useConfirm, ConfirmModal } from './ConfirmModal';

const typeLabels: Record<Ingredient['type'], { label: string; color: string }> = {
  'bun-top': { label: 'Pan Superior', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'cheese': { label: 'Queso', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  'meat': { label: 'Carne', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  'tomato': { label: 'Tomate', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  'lettuce': { label: 'Lechuga', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  'bun-bottom': { label: 'Pan Inferior', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  'custom': { label: 'Personalizado', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

export const IngredientEditor = () => {
  const { ingredients, updateIngredient, addIngredient, deleteIngredient } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Ingredient>>({});
  const { confirm, close: closeConfirm, state: confirmState } = useConfirm();

  const sortedIngredients = [...ingredients].sort((a, b) => a.order - b.order);

  const startEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setFormData(ingredient);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: `ingredient-${Date.now()}`,
      name: '',
      type: 'custom',
      enabled: true,
      order: ingredients.length + 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('El nombre del ingrediente es obligatorio.');
      return;
    }
    const isDuplicate = ingredients.some(
      i => i.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() && i.id !== formData.id
    );
    if (isDuplicate) {
      alert('Ya existe un ingrediente con este nombre.');
      return;
    }
    if (isAdding && formData.id) {
      addIngredient(formData as Ingredient);
      setIsAdding(false);
    } else if (editingId && formData) {
      updateIngredient(editingId, formData);
      setEditingId(null);
    }
    setFormData({});
  };

  const handleCancel = () => { setEditingId(null); setIsAdding(false); setFormData({}); };

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: 'Eliminar Ingrediente',
      message: `Eliminaras "${name}" permanentemente.`,
      type: 'danger',
      onConfirm: () => deleteIngredient(id)
    });
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateIngredient(id, { enabled: !enabled });
  };

  const handleReorder = (newOrder: Ingredient[]) => {
    newOrder.forEach((ing, index) => {
      if (ing.order !== index + 1) {
        updateIngredient(ing.id, { order: index + 1 });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Ingredientes</h2>
          <p className="text-gray-400 text-sm mt-1">{ingredients.length} ingrediente(s) · Para las capas del Modo 3D</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25">
          <Plus className="w-5 h-5" /> Nuevo Ingrediente
        </button>
      </div>

      {/* Banner guia 3D */}
      {!isAdding && !editingId && (
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/10 border border-blue-500/20 p-5 rounded-2xl flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="text-blue-400 font-bold mb-1">Capas para el Modo 3D</h4>
            <ul className="text-sm text-blue-200/80 space-y-1 list-disc list-inside">
              <li>Usa <strong>PNG con fondo transparente</strong> para que las capas se superpongan correctamente.</li>
              <li><strong>Orden 1 = capa superior</strong> (ej: pan de arriba). Numeros mayores van abajo.</li>
              <li>Arrastra las tarjetas para reordenar las capas facilmente.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Formulario */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 space-y-5 border-2 border-orange-500/30 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {isAdding ? 'Nuevo Ingrediente' : 'Editar Ingrediente'}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button onClick={handleCancel} className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition-colors">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Ej: Pepinillos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tipo</label>
                <select value={formData.type || 'custom'} onChange={(e) => setFormData({ ...formData, type: e.target.value as Ingredient['type'] })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                  <option value="bun-top">Pan Superior</option>
                  <option value="cheese">Queso</option>
                  <option value="meat">Carne</option>
                  <option value="tomato">Tomate</option>
                  <option value="lettuce">Lechuga</option>
                  <option value="bun-bottom">Pan Inferior</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Orden (capa)</label>
                <input type="number" min="1" value={formData.order || 0} onChange={(e) => { const v = parseInt(e.target.value); setFormData({ ...formData, order: isNaN(v) ? 0 : v }); }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.enabled || false} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm text-gray-300">Habilitado</span>
              </label>
            </div>

            <ImageUploader currentImage={formData.image} onImageChange={(url) => setFormData({ ...formData, image: url })}
              label="Imagen del Ingrediente (PNG sin fondo recomendado)" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de ingredientes con drag & drop */}
      {sortedIngredients.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
          <Layers className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No hay ingredientes</p>
          <p className="text-gray-500 text-sm mb-6">Crea ingredientes para el Modo 3D y asignalos a tus productos</p>
          <button onClick={startAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-5 h-5" /> Nuevo Ingrediente
          </button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={sortedIngredients} onReorder={handleReorder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedIngredients.map((ingredient, index) => {
            const typeInfo = typeLabels[ingredient.type] || typeLabels.custom;
            return (
              <Reorder.Item key={ingredient.id} value={ingredient} className="list-none">
                <motion.div
                  layout
                  className={`group relative bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    ingredient.enabled
                      ? 'border-gray-700/50 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5'
                      : 'border-gray-700/30 opacity-50'
                  }`}
                >
                  {/* Imagen */}
                  <div className="relative w-full h-28 bg-gray-700/50 overflow-hidden">
                    {ingredient.image ? (
                      <img src={ingredient.image} alt={ingredient.name} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    {/* Order badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded-lg text-xs font-bold text-white">
                      #{ingredient.order}
                    </div>
                    {/* Drag handle */}
                    <div className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-white truncate">{ingredient.name}</h3>
                        <span className={`inline-block mt-1.5 px-2 py-0.5 text-xs rounded-lg border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <button onClick={() => toggleEnabled(ingredient.id, ingredient.enabled)}
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ml-2 ${
                          ingredient.enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                        }`}>
                        {ingredient.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700/50">
                      <button onClick={() => startEdit(ingredient)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/90 text-white rounded-xl hover:bg-blue-500 transition-colors text-sm font-medium">
                        <Pencil className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button onClick={() => handleDelete(ingredient.id, ingredient.name)}
                        className="flex items-center justify-center w-9 h-9 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm}
        title={confirmState.title} message={confirmState.message} type={confirmState.type} />
    </div>
  );
};
