import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { MeatOption } from '../../types';
import { ImageUploader } from './ImageUploader';

export const MeatEditor = () => {
  const { meats, updateMeat, addMeat, deleteMeat } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<MeatOption>>({});

  const startEdit = (meat: MeatOption) => {
    setEditingId(meat.id);
    setFormData(meat);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: `meat-${Date.now()}`,
      name: '',
      shortName: '',
      style: 'from-[#8B4513] via-[#A0522D] to-[#D2691E]',
      price: 0,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    });
  };

  const handleSave = () => {
    if (isAdding && formData.id) {
      addMeat(formData as MeatOption);
      setIsAdding(false);
    } else if (editingId && formData) {
      updateMeat(editingId, formData);
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
    if (confirm('¿Estás seguro de eliminar esta carne?')) {
      deleteMeat(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Gestión de Carnes</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Carne
        </button>
      </div>

      {/* Form for Adding/Editing */}
      {(isAdding || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {isAdding ? 'Nueva Carne' : 'Editar Carne'}
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
                placeholder="Ej: Pollo a la Parrilla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Corto</label>
              <input
                type="text"
                value={formData.shortName || ''}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej: Pollo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Calorías</label>
              <input
                type="number"
                value={formData.calories || 0}
                onChange={(e) => setFormData({ ...formData, calories: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Proteína (g)</label>
              <input
                type="number"
                step="0.1"
                value={formData.protein || 0}
                onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grasa (g)</label>
              <input
                type="number"
                step="0.1"
                value={formData.fat || 0}
                onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Carbohidratos (g)</label>
              <input
                type="number"
                step="0.1"
                value={formData.carbs || 0}
                onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estilo (Gradient CSS)</label>
              <input
                type="text"
                value={formData.style || ''}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="from-[#...] via-[#...] to-[#...]"
              />
            </div>
          </div>

          <ImageUploader
            currentImage={formData.image}
            onImageChange={(url) => setFormData({ ...formData, image: url })}
            label="Imagen de la Carne"
          />
        </motion.div>
      )}

      {/* List of Meats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meats.map((meat) => (
          <motion.div
            key={meat.id}
            layout
            className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-orange-500/50 transition-all"
          >
            {meat.image && (
              <div className="w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-700">
                <img src={meat.image} alt={meat.name} className="w-full h-full object-cover" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-white mb-2">{meat.name}</h3>
            <div className="text-sm text-gray-400 space-y-1 mb-3">
              <p>Precio: ${meat.price.toFixed(2)}</p>
              <p>Calorías: {meat.calories}</p>
              <p>Proteína: {meat.protein}g | Grasa: {meat.fat}g</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(meat)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(meat.id)}
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
