import { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Palette, AlertTriangle, Lock } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUploader } from './ImageUploader';

export const SiteConfigEditor = () => {
  const { siteConfig, updateSiteConfig, resetToDefaults } = useMenu();
  const { adminPassword, setAdminPassword } = useAuth();
  const [formData, setFormData] = useState(siteConfig);
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleSave = () => {
    updateSiteConfig(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = () => {
    if (newPassword.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    setAdminPassword(newPassword);
    setNewPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const colorPresets = [
    { name: 'Naranja (Default)', primary: '#FF9F0A', secondary: '#FF7A00', accent: '#FFD700' },
    { name: 'Rojo Pasión', primary: '#DC2626', secondary: '#991B1B', accent: '#FCA5A5' },
    { name: 'Azul Océano', primary: '#0EA5E9', secondary: '#0369A1', accent: '#7DD3FC' },
    { name: 'Verde Fresco', primary: '#10B981', secondary: '#047857', accent: '#6EE7B7' },
    { name: 'Púrpura Real', primary: '#8B5CF6', secondary: '#6D28D9', accent: '#C4B5FD' },
  ];

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setFormData({
      ...formData,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Configuración General</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            saved 
              ? 'bg-green-500 text-white' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Información Básica */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4">Información del Sitio</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Sitio</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              placeholder="Ej: Burger House"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de Sucursal</label>
            <input
              type="text"
              value={formData.branchName}
              onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              placeholder="Ej: Sucursal Centro"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Eslogan</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              placeholder="Ej: Las mejores hamburguesas de la ciudad"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="COP">Peso Colombiano (COP)</option>
              <option value="ARS">Peso Argentino (ARS)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Símbolo de Moneda</label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              placeholder="$"
            />
          </div>
        </div>

        <div className="pt-4">
          <ImageUploader
            currentImage={formData.logo}
            onImageChange={(url) => setFormData({ ...formData, logo: url })}
            label="Logo del Sitio"
          />
        </div>
      </div>

      {/* Colores del Tema */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-white">Colores del Tema</h3>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">Paletas Predefinidas</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-left"
              >
                <div className="flex gap-1 mb-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
                </div>
                <p className="text-xs text-gray-300">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color Principal</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color Secundario</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de Acento</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de Fondo</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.backgroundColor}
                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color de Texto</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="w-16 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
              />
              <input
                type="text"
                value={formData.textColor}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: formData.backgroundColor }}>
          <h4 className="text-lg font-semibold mb-4" style={{ color: formData.textColor }}>
            Vista Previa del Tema
          </h4>
          <button
            className="px-6 py-3 rounded-full font-bold text-white transition-all hover:scale-105"
            style={{
              background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})`,
            }}
          >
            Botón de Ejemplo
          </button>
          <p className="mt-3 text-sm" style={{ color: formData.accentColor }}>
            Texto de acento • {formData.currencySymbol}12.99
          </p>
        </div>
      </div>

      {/* Zona de Peligro */}
      <div className="bg-red-900/20 border-2 border-red-500/50 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Zona de Peligro</h3>
            <p className="text-sm text-gray-400">Acciones irreversibles y seguridad</p>
          </div>
        </div>
        
        {/* Cambiar Contraseña */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-orange-500/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-orange-500" />
            <h4 className="text-white font-medium">Cambiar Contraseña del Administrador</h4>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Contraseña actual: <code className="px-2 py-1 bg-gray-800 rounded text-orange-400">
              {'•'.repeat(adminPassword.length)}
            </code>
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña (mín. 4 caracteres)"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handlePasswordChange}
              disabled={newPassword.length < 4}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                passwordSaved
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
              }`}
            >
              {passwordSaved ? '✓ Guardada' : 'Cambiar'}
            </button>
          </div>
        </div>

        {/* Resetear Datos */}
        <div className="bg-gray-900/50 rounded-xl p-4 border border-red-500/30">
          <h4 className="text-white font-medium mb-2">Resetear Todos los Datos</h4>
          <p className="text-sm text-gray-400 mb-4">
            Esto eliminará <strong className="text-red-400">todos los cambios que hayas hecho</strong> (productos, categorías, 
            opciones, ingredientes, imágenes subidas, configuración) y restaurará los datos por defecto del sistema. 
            Esta acción no se puede deshacer.
          </p>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all hover:scale-105"
          >
            Resetear a Valores por Defecto
          </button>
        </div>
      </div>
    </div>
  );
};
