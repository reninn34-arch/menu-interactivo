import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { ProductOptionGroup, ProductOptionValue } from '../../types';
import { ImageUploader } from './ImageUploader';

export const OptionGroupEditor = () => {
  const { optionGroups, updateOptionGroup, addOptionGroup, deleteOptionGroup } = useMenu();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState<Partial<ProductOptionGroup>>({});
  
  // Estado para editar valores individuales
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [valueFormData, setValueFormData] = useState<Partial<ProductOptionValue>>({});

  const startEditGroup = (group: ProductOptionGroup) => {
    setEditingGroupId(group.id);
    setGroupFormData(group);
    setIsAddingGroup(false);
    setExpandedGroupId(group.id);
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
  };

  const handleSaveGroup = () => {
    if (isAddingGroup && groupFormData.id) {
      addOptionGroup(groupFormData as ProductOptionGroup);
      setIsAddingGroup(false);
    } else if (editingGroupId && groupFormData) {
      updateOptionGroup(editingGroupId, groupFormData);
      setEditingGroupId(null);
    }
    setGroupFormData({});
  };

  const handleCancelGroup = () => {
    setEditingGroupId(null);
    setIsAddingGroup(false);
    setGroupFormData({});
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm('¿Seguro que quieres eliminar este grupo de opciones? Esta acción no se puede deshacer.')) {
      deleteOptionGroup(id);
    }
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
      updatedValues = updatedValues.map(v =>
        v.id === valueFormData.id ? (valueFormData as ProductOptionValue) : v
      );
    }

    updateOptionGroup(groupId, { values: updatedValues });
    setEditingValueId(null);
    setValueFormData({});
  };

  const handleDeleteValue = (groupId: string, valueId: string) => {
    const group = optionGroups.find(g => g.id === groupId);
    if (!group) return;

    if (confirm('¿Eliminar este valor?')) {
      const updatedValues = group.values.filter(v => v.id !== valueId);
      updateOptionGroup(groupId, { values: updatedValues });
    }
  };

  const handleCancelValue = () => {
    setEditingValueId(null);
    setValueFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Grupos de Opciones</h2>
          <p className="text-gray-400 text-sm mt-1">
            Crea opciones personalizables (tamaños, extras, complementos) para tus productos
          </p>
        </div>
        <button
          onClick={startAddGroup}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Grupo
        </button>
      </div>

      {/* Form for Adding/Editing Group */}
      {(isAddingGroup || editingGroupId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-6 space-y-4 border border-orange-500/30"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">
              {isAddingGroup ? 'Nuevo Grupo de Opciones' : 'Editar Grupo'}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSaveGroup}
                disabled={!groupFormData.name}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                onClick={handleCancelGroup}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Grupo <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                value={groupFormData.name || ''}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej: Tamaño, Extras, Complementos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Orden
              </label>
              <input
                type="number"
                value={groupFormData.order ?? 1}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setGroupFormData({ ...groupFormData, order: isNaN(val) ? 1 : val });
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={groupFormData.description || ''}
                onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                placeholder="Ej: Elige el tamaño de tu bebida"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupFormData.required || false}
                  onChange={(e) => setGroupFormData({ ...groupFormData, required: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-300">Obligatorio</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupFormData.multiSelect || false}
                  onChange={(e) => setGroupFormData({ ...groupFormData, multiSelect: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-300">Selección múltiple</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupFormData.enabled || false}
                  onChange={(e) => setGroupFormData({ ...groupFormData, enabled: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-gray-300">Habilitado</span>
              </label>
            </div>

            {/* ✨ NUEVO: Control de Capa 3D */}
            <div className="md:col-span-2 p-4 bg-gradient-to-r from-blue-900/20 to-transparent border border-blue-500/30 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupFormData.is3DLayer || false}
                  onChange={(e) => setGroupFormData({ ...groupFormData, is3DLayer: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-400 focus:ring-blue-400"
                />
                <div>
                  <span className="text-white font-semibold block">🎨 Renderizar como Capa 3D</span>
                  <span className="text-xs text-gray-400">
                    Las imágenes de estas opciones se apilarán físicamente sobre el producto (ej: Tipos de Carne en una hamburguesa).
                  </span>
                </div>
              </label>

              {groupFormData.is3DLayer && (
                <div className="mt-3 ml-8 flex items-center gap-3">
                  <label className="text-sm text-gray-300">Posición en la pila (orden):</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={groupFormData.layerOrder ?? 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setGroupFormData({ ...groupFormData, layerOrder: isNaN(val) ? 5 : val });
                    }}
                    className="w-20 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-xs text-gray-400">
                    Nº más bajo = abajo de la pila. Los ingredientes también tienen su propio orden.
                  </span>
                </div>
              )}
            </div>


            {groupFormData.multiSelect && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min. Selecciones
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={groupFormData.minSelections ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setGroupFormData({ ...groupFormData, minSelections: isNaN(val) ? 0 : val });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max. Selecciones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={groupFormData.maxSelections ?? 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setGroupFormData({ ...groupFormData, maxSelections: isNaN(val) ? 1 : val });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* List of Groups */}
      <div className="space-y-4">
        {optionGroups.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-gray-400">No hay grupos de opciones. Crea uno para comenzar.</p>
          </div>
        ) : (
          optionGroups
            .sort((a, b) => a.order - b.order)
            .map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                      <div className="flex gap-2">
                        {group.required && (
                          <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded">
                            Obligatorio
                          </span>
                        )}
                        {group.multiSelect && (
                          <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                            Multi-selección
                          </span>
                        )}
                        {!group.enabled && (
                          <span className="px-2 py-1 text-xs bg-gray-600 text-gray-400 rounded">
                            Deshabilitado
                          </span>
                        )}
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {group.values.length} {group.values.length === 1 ? 'valor' : 'valores'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setExpandedGroupId(expandedGroupId === group.id ? null : group.id);
                        setEditingValueId(null);
                        setValueFormData({});
                      }}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Ver valores"
                    >
                      {expandedGroupId === group.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => startEditGroup(group)}
                      className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar grupo"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Eliminar grupo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Values Section */}
                <AnimatePresence>
                  {expandedGroupId === group.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700 bg-gray-900/50"
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-300">Valores</h4>
                          <button
                            onClick={() => startAddValue(group.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        </div>

                        {/* Value Form */}
                        {editingValueId && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800 rounded-lg p-4 border border-orange-500/30 space-y-3"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                  Nombre <span className="text-orange-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={valueFormData.name || ''}
                                  onChange={(e) => setValueFormData({ ...valueFormData, name: e.target.value })}
                                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                                  placeholder="Ej: Grande, Chocolate"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">
                                  Precio Modificador ($)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={valueFormData.priceModifier || 0}
                                  onChange={(e) => { const val = parseFloat(e.target.value); setValueFormData({ ...valueFormData, priceModifier: isNaN(val) ? 0 : val }); }}
                                  className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            {/* ✨ NUEVO: Configuración 3D visual para las opciones ✨ */}
                            <div className="mt-4 p-4 bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-500/30 rounded-xl">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg">
                                  <span className="text-xl">🍔</span>
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-orange-400">Apariencia en Modo 3D</h5>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    Si este grupo se usa en una vista 3D, ¿cómo se verá esta opción cuando el cliente la seleccione? Sube un PNG sin fondo o usa un color.
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4 pl-12">
                                <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                                  <ImageUploader
                                    currentImage={valueFormData.image}
                                    onImageChange={(url) => setValueFormData({ ...valueFormData, image: url || undefined })}
                                    label="Imagen de la Capa (Recomendado)"
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-400 mb-1">
                                    O usar un Estilo (CSS Gradient)
                                  </label>
                                  <input
                                    type="text"
                                    value={valueFormData.style || ''}
                                    onChange={(e) => setValueFormData({ ...valueFormData, style: e.target.value || undefined })}
                                    className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500 font-mono"
                                    placeholder="Ej: from-[#8B4513] to-[#D2691E]"
                                  />
                                </div>

                                {/* Información Nutricional (Compacta) */}
                                <div className="pt-2 border-t border-gray-700/50">
                                  <label className="block text-xs font-medium text-gray-400 mb-2">
                                    Valores Nutricionales Adicionales
                                  </label>
                                  <div className="grid grid-cols-4 gap-2">
                                    <div>
                                      <input
                                        type="number"
                                        value={valueFormData.calories || ''}
                                        onChange={(e) => { const val = parseInt(e.target.value); setValueFormData({ ...valueFormData, calories: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) }); }}
                                        className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-orange-500 text-center"
                                        placeholder="Kcal"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="number"
                                        value={valueFormData.protein || ''}
                                        onChange={(e) => { const val = parseInt(e.target.value); setValueFormData({ ...valueFormData, protein: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) }); }}
                                        className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-orange-500 text-center"
                                        placeholder="Prot(g)"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="number"
                                        value={valueFormData.fat || ''}
                                        onChange={(e) => { const val = parseInt(e.target.value); setValueFormData({ ...valueFormData, fat: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) }); }}
                                        className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-orange-500 text-center"
                                        placeholder="Grasa"
                                      />
                                    </div>
                                    <div>
                                      <input
                                        type="number"
                                        value={valueFormData.carbs || ''}
                                        onChange={(e) => { const val = parseInt(e.target.value); setValueFormData({ ...valueFormData, carbs: e.target.value === '' ? undefined : (isNaN(val) ? undefined : val) }); }}
                                        className="w-full px-2 py-1.5 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:border-orange-500 text-center"
                                        placeholder="Carbs"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-span-2 flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={valueFormData.enabled || false}
                                    onChange={(e) => setValueFormData({ ...valueFormData, enabled: e.target.checked })}
                                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500"
                                  />
                                  <span className="text-sm text-gray-300">Habilitado</span>
                                </label>

                                <div className="flex-1" />

                                <button
                                  onClick={() => handleSaveValue(group.id)}
                                  disabled={!valueFormData.name}
                                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-600"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={handleCancelValue}
                                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                          </motion.div>
                        )}

                        {/* Values List */}
                        {group.values.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No hay valores. Agrega opciones que el cliente pueda elegir.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {group.values
                              .sort((a, b) => a.order - b.order)
                              .map((value) => (
                                <div
                                  key={value.id}
                                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-white font-medium">{value.name}</span>
                                      {!value.enabled && (
                                        <span className="px-2 py-0.5 text-xs bg-gray-600 text-gray-400 rounded">
                                          Deshabilitado
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                      <span>
                                        Precio: {value.priceModifier >= 0 ? '+' : ''}${value.priceModifier.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => startEditValue(group.id, value)}
                                      className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteValue(group.id, value.id)}
                                      className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
};
