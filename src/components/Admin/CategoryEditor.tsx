import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Star, GripVertical, Package, ImageOff } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Category } from '../../types';
import { ImageUploader } from './ImageUploader';
import { useConfirm, ConfirmModal } from './ConfirmModal';

export const CategoryEditor = () => {
  const { categories, products, updateCategory, addCategory, deleteCategory } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({});
  const { confirm, close: closeConfirm, state: confirmState } = useConfirm();

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  const getProductCount = (categoryId: string) => 
    products.filter(p => p.categoryId === categoryId).length;

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData(category);
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('El nombre de la categoria es obligatorio.');
      return;
    }
    const isDuplicate = categories.some(
      c => c.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() && c.id !== formData.id
    );
    if (isDuplicate) {
      alert('Ya existe una categoria con este nombre.');
      return;
    }
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

  const handleDelete = (id: string, name: string) => {
    const productCount = getProductCount(id);
    confirm({
      title: 'Eliminar Categoria',
      message: productCount > 0
        ? `"${name}" tiene ${productCount} producto(s). Al eliminarla, todos sus productos tambien se perderan.`
        : `Eliminaras la categoria "${name}" permanentemente.`,
      type: 'danger',
      onConfirm: () => deleteCategory(id)
    });
  };

  const toggleEnabled = (id: string, enabled: boolean) => {
    updateCategory(id, { enabled: !enabled });
  };

  const handleReorder = (newOrder: Category[]) => {
    newOrder.forEach((cat, index) => {
      if (cat.order !== index + 1) {
        updateCategory(cat.id, { order: index + 1 });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Categorias</h2>
          <p className="text-gray-400 text-sm mt-1">{categories.length} categoria(s) · {products.length} producto(s) total</p>
        </div>
        <button onClick={startAdd} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25">
          <Plus className="w-5 h-5" />
          Nueva Categoria
        </button>
      </div>

      {/* Banner guia */}
      {!isAdding && !editingId && (
        <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/10 border border-purple-500/20 p-5 rounded-2xl flex items-start gap-4">
          <span className="text-3xl">🌟</span>
          <div>
            <h4 className="text-purple-400 font-bold mb-1">Categoria Principal</h4>
            <p className="text-sm text-purple-200/80 leading-relaxed">
              La categoria principal es la primera que ven tus clientes y recibe un diseno visual destacado. Arrastra las tarjetas para reordenarlas.
            </p>
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
                {isAdding ? 'Nueva Categoria' : 'Editar Categoria'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre</label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Ej: Hamburguesas" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Icono (Emoji)</label>
                <input type="text" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-2xl"
                  placeholder="🍔" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripcion</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  placeholder="Describe esta categoria..." rows={2} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.enabled || false} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm text-gray-300">Visible al publico</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.isMain || false} onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm font-semibold text-orange-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-current" /> Categoria Principal
                </span>
              </label>
            </div>

            {formData.isMain && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-200/80">
                Al guardar, cualquier otra categoria principal perdera su estado. Solo una categoria puede ser principal.
              </div>
            )}

            <ImageUploader currentImage={formData.image} onImageChange={(url) => setFormData({ ...formData, image: url })}
              label="Imagen de la Categoria" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de categorias con drag & drop */}
      {sortedCategories.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No hay categorias</p>
          <p className="text-gray-500 text-sm mb-6">Crea tu primera categoria para empezar a agregar productos</p>
          <button onClick={startAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-5 h-5" /> Nueva Categoria
          </button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={sortedCategories} onReorder={handleReorder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCategories.map((category) => {
            const productCount = getProductCount(category.id);
            return (
              <Reorder.Item key={category.id} value={category} className="list-none">
                <motion.div
                  layout
                  className={`group relative bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    category.enabled
                      ? category.isMain
                        ? 'border-purple-500/50 hover:border-purple-400 shadow-lg shadow-purple-500/10'
                        : 'border-gray-700/50 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5'
                      : 'border-gray-700/30 opacity-50'
                  }`}
                >
                  {/* Imagen */}
                  <div className="relative w-full h-36 bg-gray-700/50 overflow-hidden">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-10 h-10 text-gray-600" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                    {/* Badges superiores */}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {category.isMain && (
                        <span className="px-2.5 py-1 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                          <Star className="w-3 h-3 fill-current" /> Principal
                        </span>
                      )}
                    </div>

                    {/* Drag handle */}
                    <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {category.icon && <span className="text-2xl flex-shrink-0">{category.icon}</span>}
                          <h3 className="text-lg font-bold text-white truncate">{category.name}</h3>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-400 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                      <button onClick={() => toggleEnabled(category.id, category.enabled)}
                        className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ml-2 ${
                          category.enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                        }`}>
                        {category.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 mb-4 text-xs">
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-lg text-gray-400">
                        <Package className="w-3.5 h-3.5" />
                        {productCount} producto{productCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700/50">
                      <button onClick={() => startEdit(category)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500/90 text-white rounded-xl hover:bg-blue-500 transition-colors text-sm font-medium">
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                      <button onClick={() => handleDelete(category.id, category.name)}
                        className="flex items-center justify-center w-10 h-10 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Confirm Modal */}
      <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm}
        title={confirmState.title} message={confirmState.message} type={confirmState.type} />
    </div>
  );
};
