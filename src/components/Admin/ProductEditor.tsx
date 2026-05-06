import { useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, Eye, EyeOff, Star, Search, Filter, Zap, Copy, GripVertical, Package, ImageOff, XCircle } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { Product } from '../../types';
import { ImageUploader } from './ImageUploader';
import { useConfirm, ConfirmModal } from './ConfirmModal';

export const ProductEditor = () => {
  const { products, categories, ingredients, optionGroups, updateProduct, addProduct, deleteProduct } = useMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { confirm, close: closeConfirm, state: confirmState } = useConfirm();

  interface FilterState {
    featured: boolean | null;
    enabled: boolean | null;
    has3D: boolean | null;
    inStock: boolean | null;
  }
  const [filters, setFilters] = useState<FilterState>({ featured: null, enabled: null, has3D: null, inStock: null });

  const activeFiltersCount = useMemo(() => Object.values(filters).filter(v => v !== null).length + (searchQuery ? 1 : 0), [filters, searchQuery]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(s) && !product.description?.toLowerCase().includes(s)) return false;
      }
      if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) return false;
      if (filters.featured !== null && product.featured !== filters.featured) return false;
      if (filters.enabled !== null && product.enabled !== filters.enabled) return false;
      if (filters.has3D !== null && product.useLayeredView !== filters.has3D) return false;
      if (filters.inStock !== null && (product.inStock === false) !== filters.inStock) return false;
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [products, searchQuery, selectedCategory, filters]);

  const getCategoryName = (catId: string) => categories.find(c => c.id === catId)?.name || 'Sin categoria';

  const startEdit = (product: Product) => { setEditingId(product.id); setFormData(product); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const startAdd = () => {
    setIsAdding(true); setEditingId(null);
    const defaultCat = categories.find(c => c.enabled);
    setFormData({ id: `product-${Date.now()}`, categoryId: defaultCat?.id || categories[0]?.id || '', name: '', description: '', price: 0, enabled: true, featured: false, order: products.length + 1, ingredientIds: [], optionGroupIds: [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!formData.name?.trim()) { alert('El nombre del producto es obligatorio.'); return; }
    if (!formData.categoryId) { alert('El producto debe pertenecer a una categoria.'); return; }
    if (formData.price === undefined || formData.price < 0) { alert('El precio debe ser mayor o igual a 0.'); return; }
    const isDuplicate = products.some(p => p.name.trim().toLowerCase() === formData.name?.trim().toLowerCase() && p.id !== formData.id);
    if (isDuplicate) { alert('Ya existe un producto con este nombre.'); return; }
    if (isAdding && formData.id) { addProduct(formData as Product); setIsAdding(false); }
    else if (editingId && formData) { updateProduct(editingId, formData); setEditingId(null); }
    setFormData({});
  };

  const handleCancel = () => { setEditingId(null); setIsAdding(false); setFormData({}); };

  const handleDelete = (id: string, name: string) => {
    confirm({ title: 'Eliminar Producto', message: `Eliminaras "${name}" permanentemente.`, type: 'danger', onConfirm: () => deleteProduct(id) });
  };

  const toggleEnabled = (id: string, enabled: boolean) => { updateProduct(id, { enabled: !enabled }); };
  const toggleFeatured = (id: string, featured: boolean) => { updateProduct(id, { featured: !featured }); };

  const handleDuplicate = (product: Product) => {
    addProduct({ ...product, id: `product-${Date.now()}`, name: `${product.name} (copia)`, order: products.length + 1, enabled: true });
  };

  const handleReorder = (newOrder: Product[]) => {
    newOrder.forEach((p, index) => { if (p.order !== index + 1) updateProduct(p.id, { order: index + 1 }); });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Productos</h2>
            <p className="text-gray-400 text-sm mt-1">{products.length} producto(s) en {categories.length} categoria(s)</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={startAdd} disabled={categories.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="w-5 h-5" /> Nuevo Producto
              </button>
              {categories.length === 0 && <p className="text-xs text-red-400 mt-1 absolute right-0 top-full whitespace-nowrap">Crea una categoria primero</p>}
            </div>
          </div>
        </div>

        {/* Busqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              placeholder="Buscar productos por nombre o descripcion..." />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-medium ${
              showFilters || activeFiltersCount > 0 ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}>
            <Filter className="w-5 h-5" />
            Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="p-4 bg-gray-800 rounded-xl border border-gray-700 flex flex-wrap items-center gap-3">
                {(['featured', 'enabled', 'has3D', 'inStock'] as const).map(key => {
                  const labels = { featured: 'Destacado', enabled: 'Habilitado', has3D: 'Modo 3D', inStock: 'En Stock' };
                  const icons = { featured: <Star className="w-4 h-4" />, enabled: <Eye className="w-4 h-4" />, has3D: <Zap className="w-4 h-4" />, inStock: <Package className="w-4 h-4" /> };
                  return (
                    <button key={key} onClick={() => setFilters(prev => ({ ...prev, [key]: prev[key] === null ? true : prev[key] === true ? false : null }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters[key] === true ? 'bg-orange-500 text-white' : filters[key] === false ? 'bg-gray-600 text-gray-300 line-through' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}>
                      {icons[key]} {labels[key]}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtro por categoria */}
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
            Todas
          </button>
          {categories.filter(c => c.enabled).map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

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
              <div>
                <h3 className="text-xl font-bold text-white">{isAdding ? 'Nuevo Producto' : 'Editar Producto'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Campos con * son obligatorios</p>
              </div>
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
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Categoria <span className="text-orange-500">*</span></label>
                <select value={formData.categoryId || ''} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre <span className="text-orange-500">*</span></label>
                <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Ej: Cheeseburger Deluxe" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripcion</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                  placeholder="Descripcion del producto..." rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Precio <span className="text-orange-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input type="number" step="0.01" min="0" value={formData.price ?? 0} onChange={(e) => { const v = parseFloat(e.target.value); setFormData({ ...formData, price: isNaN(v) ? 0 : v }); }}
                    className="w-full pl-9 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Orden</label>
                <input type="number" min="1" value={formData.order ?? 0} onChange={(e) => { const v = parseInt(e.target.value); setFormData({ ...formData, order: isNaN(v) ? 0 : v }); }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Tiempo Prep. (min)</label>
                <input type="number" min="0" value={formData.estimatedTime ?? ''} onChange={(e) => { const v = parseInt(e.target.value); setFormData({ ...formData, estimatedTime: e.target.value === '' ? undefined : (isNaN(v) ? undefined : v) }); }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.inStock !== false} onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm text-gray-300">En stock</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.enabled || false} onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm text-gray-300">Habilitado</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={formData.featured || false} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm text-gray-300 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> Destacado</span>
              </label>
            </div>

            <details className="bg-gray-700/50 p-4 rounded-xl border border-gray-700">
              <summary className="text-gray-300 cursor-pointer font-medium">Informacion Nutricional (Opcional)</summary>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {(['calories', 'protein', 'fat', 'carbs'] as const).map(field => {
                  const labels = { calories: 'Calorias (kcal)', protein: 'Proteina (g)', fat: 'Grasa (g)', carbs: 'Carbs (g)' };
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">{labels[field]}</label>
                      <input type="number" min="0" value={formData[field] ?? ''} onChange={(e) => { const v = parseInt(e.target.value); setFormData({ ...formData, [field]: e.target.value === '' ? undefined : (isNaN(v) ? undefined : v) }); }}
                        className="w-full px-4 py-2.5 bg-gray-600 border border-gray-500 rounded-xl text-white focus:outline-none focus:border-orange-500" />
                    </div>
                  );
                })}
              </div>
            </details>

            {/* Ingredientes */}
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-700">
              <h4 className="text-gray-300 font-medium mb-3">Ingredientes del Producto</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                {ingredients.filter(i => i.enabled).sort((a, b) => a.order - b.order).map(ing => {
                  const sel = formData.ingredientIds?.includes(ing.id) || false;
                  return (
                    <label key={ing.id} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm ${sel ? 'bg-orange-500/20 border border-orange-500' : 'bg-gray-600/50 border border-gray-600 hover:bg-gray-600'}`}>
                      <input type="checkbox" checked={sel} onChange={(e) => {
                        const ids = formData.ingredientIds || [];
                        setFormData({ ...formData, ingredientIds: e.target.checked ? [...ids, ing.id] : ids.filter(id => id !== ing.id) });
                      }} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500" />
                      <span className="text-white truncate">{ing.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Grupos de opciones */}
            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-700">
              <h4 className="text-gray-300 font-medium mb-3">Grupos de Opciones</h4>
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                {optionGroups.filter(g => g.enabled).sort((a, b) => a.order - b.order).map(group => {
                  const sel = formData.optionGroupIds?.includes(group.id) || false;
                  return (
                    <label key={group.id} className={`flex items-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all text-sm ${sel ? 'bg-orange-500/20 border border-orange-500' : 'bg-gray-600/50 border border-gray-600 hover:bg-gray-600'}`}>
                      <input type="checkbox" checked={sel} onChange={(e) => {
                        const ids = formData.optionGroupIds || [];
                        setFormData({ ...formData, optionGroupIds: e.target.checked ? [...ids, group.id] : ids.filter(id => id !== group.id) });
                      }} className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-sm block truncate">{group.name}</span>
                        {group.description && <span className="text-xs text-gray-400 truncate block">{group.description}</span>}
                      </div>
                      {group.required && <span className="px-1.5 py-0.5 text-xs bg-orange-500/30 text-orange-300 rounded">Oblig</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modo 3D */}
            <div className={`p-5 rounded-2xl border-2 transition-all ${formData.useLayeredView ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-800 border-gray-600'}`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.useLayeredView || false} onChange={(e) => setFormData({ ...formData, useLayeredView: e.target.checked })}
                  className="w-6 h-6 rounded border-2 border-gray-500 bg-gray-700 text-blue-500 focus:ring-blue-500" />
                <div>
                  <span className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-blue-400" /> Activar Vista 3D por Capas</span>
                  <span className="text-sm text-gray-400 block">El producto se mostrara apilado en capas animadas.</span>
                </div>
              </label>
              {formData.useLayeredView && (
                <div className="mt-4 ml-9 space-y-3">
                  <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-700 space-y-2">
                    <h5 className="text-white font-semibold text-sm mb-2">Estado de las capas:</h5>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={formData.ingredientIds?.length ? 'text-green-400' : 'text-yellow-400'}>
                        {formData.ingredientIds?.length ? '✅' : '⚠️'}
                      </span>
                      <span className="text-gray-300">Capas estaticas: {formData.ingredientIds?.length || 0} ingrediente(s)</span>
                    </div>
                    {(() => {
                      const dyn3D = optionGroups.filter(g => g.enabled && g.is3DLayer && formData.optionGroupIds?.includes(g.id));
                      return (
                        <div className="flex items-center gap-2 text-sm">
                          <span className={dyn3D.length ? 'text-green-400' : 'text-yellow-400'}>{dyn3D.length ? '✅' : '⚠️'}</span>
                          <span className="text-gray-300">Capas dinamicas: {dyn3D.length ? dyn3D.map(g => g.name).join(', ') : 'Ningun grupo 3D asignado'}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            <ImageUploader currentImage={formData.image} onImageChange={(url) => setFormData({ ...formData, image: url })} label="Imagen del Producto" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid de productos con drag & drop */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No se encontraron productos</p>
          <p className="text-gray-500 text-sm mb-6">
            {searchQuery || activeFiltersCount > 0 ? 'Intenta ajustar los filtros o la busqueda.' : 'Agrega tu primer producto para empezar.'}
          </p>
          {!searchQuery && activeFiltersCount === 0 && (
            <button onClick={startAdd} disabled={categories.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
              <Plus className="w-5 h-5" /> Nuevo Producto
            </button>
          )}
        </div>
      ) : (
        <Reorder.Group axis="y" values={filteredProducts} onReorder={handleReorder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Reorder.Item key={product.id} value={product} className="list-none">
              <motion.div
                layout
                className={`group relative bg-gray-800/80 backdrop-blur-sm rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  product.enabled
                    ? product.featured ? 'border-orange-500/40 hover:border-orange-400 shadow-lg shadow-orange-500/10' : 'border-gray-700/50 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5'
                    : 'border-gray-700/30 opacity-50'
                }`}
              >
                {/* Imagen */}
                <div className="relative w-full h-44 bg-gray-700/50 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {product.featured && <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg"><Star className="w-3 h-3 fill-current" /> Destacado</span>}
                    {product.useLayeredView && <span className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg"><Zap className="w-3 h-3 fill-current" /> 3D</span>}
                  </div>
                  {/* Drag handle */}
                  <div className="absolute top-3 right-3 p-1.5 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                  {/* Price overlay */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-2xl font-black text-white drop-shadow-lg">${product.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <p className="text-xs text-orange-500 mb-1 font-medium">{getCategoryName(product.categoryId)}</p>
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{product.name}</h3>
                  {product.description && <p className="text-sm text-gray-400 line-clamp-2 mb-2">{product.description}</p>}

                  {/* Ingredientes */}
                  {product.ingredientIds && product.ingredientIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.ingredientIds.slice(0, 3).map(ingId => {
                        const ing = ingredients.find(i => i.id === ingId);
                        return ing ? <span key={ingId} className="text-xs bg-gray-700/70 text-gray-300 px-2 py-0.5 rounded-lg">{ing.name}</span> : null;
                      })}
                      {product.ingredientIds.length > 3 && <span className="text-xs text-gray-500">+{product.ingredientIds.length - 3}</span>}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-gray-700/50">
                    <button onClick={() => toggleEnabled(product.id, product.enabled)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${product.enabled ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'}`}>
                      {product.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => toggleFeatured(product.id, product.featured || false)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${product.featured ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-700 text-gray-500 hover:bg-gray-600'}`}>
                      <Star className={`w-3.5 h-3.5 ${product.featured ? 'fill-current' : ''}`} />
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => handleDuplicate(product)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all" title="Duplicar">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => startEdit(product)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-500 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(product.id, product.name)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm}
        title={confirmState.title} message={confirmState.message} type={confirmState.type} />
    </div>
  );
};
