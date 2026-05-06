import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp, GripVertical, Layers, Hash } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { ProductOptionGroup, ProductOptionValue } from '../../types';
import { ImageUploader } from './ImageUploader';
import { useConfirm, ConfirmModal } from './ConfirmModal';

export const OptionGroupEditor = () => {
  const { optionGroups, updateOptionGroup, addOptionGroup, deleteOptionGroup } = useMenu();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState<Partial<ProductOptionGroup>>({});
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [valueFormData, setValueFormData] = useState<Partial<ProductOptionValue>>({});
  const { confirm, close: closeConfirm, state: confirmState } = useConfirm();

  const sortedGroups = [...optionGroups].sort((a, b) => a.order - b.order);

  const startEditGroup = (group: ProductOptionGroup) => {
    setEditingGroupId(group.id);
    setGroupFormData(group);
    setIsAddingGroup(false);
    setExpandedGroupId(group.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAddGroup = () => {
    setIsAddingGroup(true);
    setEditingGroupId(null);
    setGroupFormData({
      id: `option-group-${Date.now()}`,
      name: '',
      description: '',
      required: false,
      multiSelect: false,
      minSelections: 1,
      maxSelections: 1,
      values: [],
      enabled: true,
      order: optionGroups.length + 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveGroup = () => {
    if (!groupFormData.name?.trim()) {
      alert('El grupo debe tener un nombre.');
      return;
    }
    const isDuplicate = optionGroups.some(
      g => g.name.trim().toLowerCase() === groupFormData.name?.trim().toLowerCase() && g.id !== groupFormData.id
    );
    if (isDuplicate) {
      alert('Ya existe un grupo con este nombre.');
      return;
    }
    if (isAddingGroup && groupFormData.id) {
      addOptionGroup(groupFormData as ProductOptionGroup);
      setIsAddingGroup(false);
    } else if (editingGroupId && groupFormData) {
      updateOptionGroup(editingGroupId, groupFormData);
      setEditingGroupId(null);
    }
    setGroupFormData({});
  };

  const handleCancelGroup = () => { setEditingGroupId(null); setIsAddingGroup(false); setGroupFormData({}); };

  const handleDeleteGroup = (id: string, name: string) => {
    confirm({
      title: 'Eliminar Grupo de Opciones',
      message: `Eliminaras "${name}" y todos sus valores permanentemente.`,
      type: 'danger',
      onConfirm: () => deleteOptionGroup(id)
    });
  };

  const handleReorderGroups = (newOrder: ProductOptionGroup[]) => {
    newOrder.forEach((g, index) => {
      if (g.order !== index + 1) updateOptionGroup(g.id, { order: index + 1 });
    });
  };

  // --- Manejo de valores ---
  const startAddValue = (groupId: string) => {
    const group = optionGroups.find(g => g.id === groupId);
    if (!group) return;
    setEditingValueId(`new-${Date.now()}`);
    setValueFormData({
      id: `value-${Date.now()}`,
      name: '',
      priceModifier: 0,
      enabled: true,
      order: group.values.length + 1,
    });
  };

  const startEditValue = (groupId: string, value: ProductOptionValue) => {
    setEditingValueId(value.id);
    setValueFormData(value);
  };

  const handleSaveValue = (groupId: string) => {
    if (!valueFormData.id || !valueFormData.name) return;
    const group = optionGroups.find(g => g.id === groupId);
    if (!group) return;
    const isNewValue = editingValueId?.startsWith('new-');
    let updatedValues = [...group.values];
    if (isNewValue) {
      updatedValues.push(valueFormData as ProductOptionValue);
    } else {
      updatedValues = updatedValues.map(v => v.id === valueFormData.id ? (valueFormData as ProductOptionValue) : v);
    }
    updateOptionGroup(groupId, { values: updatedValues });
    setEditingValueId(null);
    setValueFormData({});
  };

  const handleDeleteValue = (groupId: string, valueId: string) => {
    confirm({
      title: 'Eliminar Valor',
      message: 'Eliminaras este valor de opcion.',
      type: 'warning',
      onConfirm: () => {
        const group = optionGroups.find(g => g.id === groupId);
        if (!group) return;
        updateOptionGroup(groupId, { values: group.values.filter(v => v.id !== valueId) });
      }
    });
  };

  const handleCancelValue = () => { setEditingValueId(null); setValueFormData({}); };

  const handleReorderValues = (groupId: string, newOrder: ProductOptionValue[]) => {
    updateOptionGroup(groupId, { values: newOrder });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Grupos de Opciones</h2>
          <p className="text-gray-400 text-sm mt-1">Crea opciones personalizables (tamanos, extras, complementos)</p>
        </div>
        <button onClick={startAddGroup} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25">
          <Plus className="w-5 h-5" /> Nuevo Grupo
        </button>
      </div>

      {/* Formulario de grupo */}
      <AnimatePresence>
        {(isAddingGroup || editingGroupId) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 space-y-5 border-2 border-orange-500/30 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {isAddingGroup ? 'Nuevo Grupo de Opciones' : 'Editar Grupo'}
              </h3>
              <div className="flex gap-2">
                <button onClick={handleSaveGroup} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium">
                  <Save className="w-4 h-4" /> Guardar
                </button>
                <button onClick={handleCancelGroup} className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition-colors">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre del Grupo <span className="text-orange-500">*</span></label>
                <input type="text" value={groupFormData.name || ''} onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Ej: Tamano, Extras" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Orden</label>
                <input type="number" min="1" value={groupFormData.order ?? 1} onChange={(e) => { const v = parseInt(e.target.value); setGroupFormData({ ...groupFormData, order: isNaN(v) ? 1 : v }); }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Descripcion</label>
                <input type="text" value={groupFormData.description || ''} onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Ej: Elige el tamano de tu bebida" />
              </div>
              <div className="md:col-span-2 flex flex-wrap items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={groupFormData.required || false} onChange={(e) => setGroupFormData({ ...groupFormData, required: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-gray-300">Obligatorio</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={groupFormData.multiSelect || false} onChange={(e) => setGroupFormData({ ...groupFormData, multiSelect: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-gray-300">Multi-seleccion</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={groupFormData.enabled || false} onChange={(e) => setGroupFormData({ ...groupFormData, enabled: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-gray-300">Habilitado</span>
                </label>
              </div>

              {groupFormData.multiSelect && (
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Min. Selecciones</label>
                    <input type="number" min="0" value={groupFormData.minSelections ?? 0} onChange={(e) => { const v = parseInt(e.target.value); setGroupFormData({ ...groupFormData, minSelections: isNaN(v) ? 0 : v }); }}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Max. Selecciones</label>
                    <input type="number" min="1" value={groupFormData.maxSelections ?? 1} onChange={(e) => { const v = parseInt(e.target.value); setGroupFormData({ ...groupFormData, maxSelections: isNaN(v) ? 1 : v }); }}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                  </div>
                </div>
              )}

              {/* Capa 3D */}
              <div className="md:col-span-2 p-5 bg-gradient-to-r from-blue-900/20 to-transparent border-2 border-blue-500/30 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={groupFormData.is3DLayer || false} onChange={(e) => setGroupFormData({ ...groupFormData, is3DLayer: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-400 focus:ring-blue-400" />
                  <div>
                    <span className="text-white font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-blue-400" /> Renderizar como Capa 3D
                    </span>
                    <span className="text-xs text-gray-400 block mt-0.5">
                      Las imagenes de estas opciones se apilaran sobre el producto (ej: Tipos de Carne)
                    </span>
                  </div>
                </label>
                {groupFormData.is3DLayer && (
                  <div className="mt-4 ml-8 flex items-center gap-3">
                    <label className="text-sm text-gray-300">Posicion en la pila:</label>
                    <input type="number" min="1" max="99" value={groupFormData.layerOrder ?? 5} onChange={(e) => { const v = parseInt(e.target.value); setGroupFormData({ ...groupFormData, layerOrder: isNaN(v) ? 5 : v }); }}
                      className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white text-center focus:outline-none focus:border-blue-400" />
                    <span className="text-xs text-gray-500">N° mas bajo = mas abajo</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de grupos */}
      {sortedGroups.length === 0 ? (
        <div className="text-center py-20 bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-700">
          <Hash className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No hay grupos de opciones</p>
          <p className="text-gray-500 text-sm mb-6">Crea opciones como Tamanos, Extras o Complementos para tus productos</p>
          <button onClick={startAddGroup} className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
            <Plus className="w-5 h-5" /> Nuevo Grupo
          </button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={sortedGroups} onReorder={handleReorderGroups} className="space-y-3">
          {sortedGroups.map((group) => (
            <Reorder.Item key={group.id} value={group} className="list-none">
              <motion.div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border-2 border-gray-700/50 overflow-hidden transition-all hover:border-orange-500/20">
                {/* Header del grupo */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="p-1.5 bg-black/30 rounded-lg cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white truncate">{group.name}</h3>
                        <div className="flex gap-1.5">
                          {group.required && <span className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded-lg font-medium">Obligatorio</span>}
                          {group.multiSelect && <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-lg font-medium">Multi</span>}
                          {group.is3DLayer && <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-lg font-medium flex items-center gap-1"><Layers className="w-3 h-3" /> 3D</span>}
                          {!group.enabled && <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-400 rounded-lg">Off</span>}
                        </div>
                      </div>
                      {group.description && <p className="text-sm text-gray-400 ml-11">{group.description}</p>}
                      <p className="text-xs text-gray-500 mt-1.5 ml-11">{group.values.length} valor(es)</p>
                    </div>

                    <div className="flex items-center gap-1.5 ml-4">
                      <button onClick={() => { setExpandedGroupId(expandedGroupId === group.id ? null : group.id); setEditingValueId(null); setValueFormData({}); }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-all">
                        {expandedGroupId === group.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      <button onClick={() => startEditGroup(group)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-500 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Valores expandidos */}
                <AnimatePresence>
                  {expandedGroupId === group.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t-2 border-gray-700/50 bg-gray-900/50 p-5 space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Valores</h4>
                          <button onClick={() => startAddValue(group.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
                            <Plus className="w-4 h-4" /> Agregar
                          </button>
                        </div>

                        {/* Formulario de valor */}
                        <AnimatePresence>
                          {editingValueId && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.98 }}
                              className="bg-gray-800 rounded-2xl p-4 border-2 border-orange-500/30 space-y-4"
                            >
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-400 mb-1">Nombre <span className="text-orange-500">*</span></label>
                                  <input type="text" value={valueFormData.name || ''} onChange={(e) => setValueFormData({ ...valueFormData, name: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                                    placeholder="Ej: Grande" />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-400 mb-1">Precio (+$)</label>
                                  <input type="number" step="0.01" value={valueFormData.priceModifier || 0} onChange={(e) => { const v = parseFloat(e.target.value); setValueFormData({ ...valueFormData, priceModifier: isNaN(v) ? 0 : v }); }}
                                    className="w-full px-3 py-2.5 text-sm bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500" />
                                </div>
                              </div>

                              <div className="p-4 bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-500/30 rounded-xl">
                                <h5 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                                  <Layers className="w-4 h-4" /> Apariencia 3D
                                </h5>
                                <div className="space-y-3 pl-0">
                                  <ImageUploader currentImage={valueFormData.image} onImageChange={(url) => setValueFormData({ ...valueFormData, image: url || undefined })}
                                    label="Imagen de la Capa" />
                                  <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Estilo CSS (alternativa)</label>
                                    <input type="text" value={valueFormData.style || ''} onChange={(e) => setValueFormData({ ...valueFormData, style: e.target.value || undefined })}
                                      className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 font-mono"
                                      placeholder="Ej: from-[#8B4513] to-[#D2691E]" />
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-700/50">
                                    <input type="number" value={valueFormData.calories || ''} onChange={(e) => { const v = parseInt(e.target.value); setValueFormData({ ...valueFormData, calories: e.target.value === '' ? undefined : (isNaN(v) ? undefined : v) }); }}
                                      className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 text-center" placeholder="Kcal" />
                                    <input type="number" value={valueFormData.protein || ''} onChange={(e) => { const v = parseInt(e.target.value); setValueFormData({ ...valueFormData, protein: e.target.value === '' ? undefined : (isNaN(v) ? undefined : v) }); }}
                                      className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 text-center" placeholder="Prot" />
                                    <input type="number" value={valueFormData.fat || ''} onChange={(e) => { const v = parseInt(e.target.value); setValueFormData({ ...valueFormData, fat: e.target.value === '' ? undefined : (isNaN(v) ? undefined : v) }); }}
                                      className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 text-center" placeholder="Grasa" />
                                    <input type="number" value={valueFormData.carbs || ''} onChange={(e) => { const v = parseInt(e.target.value); setValueFormData({ ...valueFormData, carbs: e.target.value === '' ? undefined : (isNaN(v) ? undefined : v) }); }}
                                      className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-orange-500 text-center" placeholder="Carbs" />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" checked={valueFormData.enabled || false} onChange={(e) => setValueFormData({ ...valueFormData, enabled: e.target.checked })}
                                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500" />
                                  <span className="text-sm text-gray-300">Habilitado</span>
                                </label>
                                <div className="flex gap-2">
                                  <button onClick={handleCancelValue} className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">Cancelar</button>
                                  <button onClick={() => handleSaveValue(group.id)} disabled={!valueFormData.name}
                                    className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Guardar</button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Lista de valores con drag & drop */}
                        {group.values.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-6">No hay valores. Agrega opciones para que el cliente elija.</p>
                        ) : (
                          <Reorder.Group axis="y" values={group.values.sort((a, b) => a.order - b.order)} onReorder={(newOrder) => handleReorderValues(group.id, newOrder)} className="space-y-2">
                            {group.values.sort((a, b) => a.order - b.order).map((value) => (
                              <Reorder.Item key={value.id} value={value} className="list-none">
                                <div className="flex items-center justify-between p-3 bg-gray-800/60 rounded-xl border border-gray-700 hover:border-gray-600 transition-all group">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="cursor-grab active:cursor-grabbing p-1">
                                      <GripVertical className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="text-white font-medium block truncate">{value.name}</span>
                                      {value.priceModifier !== 0 && (
                                        <span className="text-xs text-orange-400">
                                          {value.priceModifier > 0 ? '+' : ''}${value.priceModifier.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    {!value.enabled && <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-400 rounded-lg">Off</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5 ml-2">
                                    <button onClick={() => startEditValue(group.id, value)}
                                      className="p-2 text-blue-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all">
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteValue(group.id, value.id)}
                                      className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
