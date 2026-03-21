import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Ingredient } from '../../types';
import { ImageUploader } from './ImageUploader';

export const IngredientEditor = () => {
  const { ingredients, updateIngredient, addIngredient, deleteIngredient } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Ingredient>>({});

  const startEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setFormData(ingredient);
    setIsAdding(false);
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
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('⚠️ El ingrediente debe tener un nombre.');
      return;
    }
    
    // Verificar nombres duplicados
    const isDuplicate = ingredients.some(
      i => i.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() && i.id !== formData.id
    );
    if (isDuplicate) {
      alert('⚠️ Ya existe un ingrediente con este nombre. Por favor, elige otro.');
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

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ingrediente?')) {
      deleteIngredient(id);
    }
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateIngredient(id, { enabled: !enabled });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestión de Ingredientes</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Ingrediente
        </button>
      </div>

      {/* ✨ NUEVO: Banner Guía para Ingredientes 3D ✨ */}
      {!isAdding && !editingId && (
        <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/10 border border-blue-500/30 p-4 rounded-xl flex items-start gap-4">
          <div className="text-2xl bg-blue-500/20 p-2 rounded-lg">💡</div>
          <div>
            <h4 className="text-blue-400 font-bold mb-1">¿Cómo crear capas perfectas para el Modo 3D?</h4>
            <ul className="text-sm text-blue-100/80 space-y-1 list-disc list-inside">
              <li><strong>Formato de imagen:</strong> Usa siempre <strong>PNG con fondo transparente</strong> para que las capas se superpongan correctamente.</li>
              <li><strong>El Orden importa:</strong> El número define cómo se apilan. El <strong>1 es la capa más alta</strong> (ej: Pan Superior). Números mayores van abajo (ej: 6 = Pan Inferior).</li>
              <li><strong>Recorte:</strong> Recorta la imagen al ras del ingrediente para evitar espacios vacíos que arruinen la animación.</li>
            </ul>
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
              {isAdding ? 'Nuevo Ingrediente' : 'Editar Ingrediente'}
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
                placeholder="Ej: Pepinillos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <select
                value={formData.type || 'custom'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Ingredient['type'] })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Orden</label>
              <input
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled || false}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-300">Habilitado</span>
              </label>
            </div>
          </div>

          <ImageUploader
            currentImage={formData.image}
            onImageChange={(url) => setFormData({ ...formData, image: url })}
            label="Imagen del Ingrediente"
          />
        </motion.div>
      )}

      {/* List of Ingredients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ingredients.sort((a, b) => a.order - b.order).map((ingredient) => (
          <motion.div
            key={ingredient.id}
            layout
            className={`bg-gray-800 rounded-xl p-4 border transition-all ${
              ingredient.enabled 
                ? 'border-gray-700 hover:border-orange-500/50' 
                : 'border-gray-700 opacity-50'
            }`}
          >
            {ingredient.image && (
              <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-gray-700">
                <img src={ingredient.image} alt={ingredient.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{ingredient.name}</h3>
              <button
                onClick={() => toggleEnabled(ingredient.id, ingredient.enabled)}
                className={`p-1 rounded transition-colors ${
                  ingredient.enabled ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                {ingredient.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-sm text-gray-400 mb-3">
              <p>Tipo: {ingredient.type}</p>
              <p>Orden: {ingredient.order}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(ingredient)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(ingredient.id)}
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
