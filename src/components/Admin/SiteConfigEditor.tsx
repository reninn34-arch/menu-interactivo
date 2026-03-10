import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Palette, AlertTriangle, Lock, RefreshCw } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUploader } from './ImageUploader';

export const SiteConfigEditor = () => {
  const { siteConfig, updateSiteConfig, resetToDefaults, invalidateCache } = useMenu();
  const { adminPassword, setAdminPassword } = useAuth();
  const [formData, setFormData] = useState(siteConfig);
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ lastUpdate: number; isValid: boolean } | null>(null);

  // Sincronizar formData con siteConfig cuando cambie
  useEffect(() => {
    setFormData(siteConfig);
  }, [siteConfig]);

  // Obtener información del caché
  useEffect(() => {
    const getCacheInfo = () => {
      try {
        const timestamp = localStorage.getItem('menu_cache_timestamp');
        if (timestamp) {
          const lastUpdate = parseInt(timestamp, 10);
          const timeDiff = Date.now() - lastUpdate;
          const isValid = timeDiff < 24 * 60 * 60 * 1000; // 24 horas
          setCacheInfo({ lastUpdate, isValid });
        }
      } catch {
        setCacheInfo(null);
      }
    };
    
    getCacheInfo();
    const interval = setInterval(getCacheInfo, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const formatTimeSince = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `hace ${hours}h ${minutes}m`;
    }
    return `hace ${minutes}m`;
  };

  const handleInvalidateCache = () => {
    if (confirm('¿Quieres forzar una actualización del caché? Los clientes verán los cambios más recientes en su próxima visita.')) {
      invalidateCache();
      const getCacheInfo = () => {
        try {
          const timestamp = localStorage.getItem('menu_cache_timestamp');
          if (timestamp) {
            const lastUpdate = parseInt(timestamp, 10);
            const timeDiff = Date.now() - lastUpdate;
            const isValid = timeDiff < 24 * 60 * 60 * 1000;
            setCacheInfo({ lastUpdate, isValid });
          }
        } catch {
          setCacheInfo(null);
        }
      };
      getCacheInfo();
      alert('Caché actualizado. Los cambios se verán reflejados la próxima vez que se cargue el menú.');
    }
  };

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

      {/* WHATSAPP Y DIRECCIÓN - SECCIÓN PRINCIPAL */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 border-2 border-green-400 shadow-xl space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          📱 WhatsApp y Dirección
          <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">Importante</span>
        </h3>
        <p className="text-white/90 mb-4 text-sm">
          Configura el número de WhatsApp para recibir pedidos y la dirección de tu restaurante
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              🏪 WhatsApp para RECOGER en Tienda
            </label>
            <input
              type="text"
              value={formData.whatsappNumberPickup || ''}
              onChange={(e) => setFormData({ ...formData, whatsappNumberPickup: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30"
              placeholder="Ej: 593987654321 (número del restaurante)"
            />
            <p className="text-xs text-white/70 mt-2">
              Este número recibirá los pedidos de RECOGER EN TIENDA
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              🚚 WhatsApp para DELIVERY
            </label>
            <input
              type="text"
              value={formData.whatsappNumberDelivery || ''}
              onChange={(e) => setFormData({ ...formData, whatsappNumberDelivery: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30"
              placeholder="Ej: 593998765432 (servicio de delivery)"
            />
            <p className="text-xs text-white/70 mt-2">
              Este número recibirá los pedidos con DELIVERY (puede ser un servicio externo)
            </p>
            <p className="text-xs text-white/80 mt-1 font-medium">
              🇪🇨 Formato Ecuador: 593 + 9 dígitos | Ejemplo: 593987654321
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              📍 Dirección del Restaurante
            </label>
            <textarea
              value={formData.restaurantAddress || ''}
              onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
              className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 resize-none"
              placeholder="Ej: Av. 9 de Octubre y Malecón, Guayaquil, Ecuador"
              rows={2}
            />
            <p className="text-xs text-white/70 mt-2">
              Esta dirección aparecerá en los pedidos enviados por WhatsApp
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">
              🚚 Costo de Delivery
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.deliveryCost || 0}
              onChange={(e) => setFormData({ ...formData, deliveryCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-white/20 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30"
              placeholder="Ej: 2.50"
            />
            <p className="text-xs text-white/70 mt-2">
              Este costo se agregará automáticamente a los pedidos con delivery
            </p>
          </div>
        </div>
      </div>

      {/* HORARIOS DE OPERACIÓN */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 border-2 border-blue-400 shadow-xl space-y-4">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          🕐 Horarios de Operación
          <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">Importante</span>
        </h3>
        <p className="text-white/90 mb-4 text-sm">
          Configura los días y horarios en los que aceptas pedidos
        </p>

        {/* Allow Orders Outside Hours Toggle */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowOrdersOutsideHours || false}
              onChange={(e) => setFormData({ ...formData, allowOrdersOutsideHours: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-2 border-white/50 bg-white/20 checked:bg-orange-500 focus:ring-2 focus:ring-orange-500"
            />
            <div>
              <span className="text-white font-semibold">Permitir pedidos fuera de horario</span>
              <p className="text-xs text-white/70 mt-1">
                Si está activado, los clientes podrán hacer pedidos incluso cuando estés cerrado
              </p>
            </div>
          </label>
        </div>

        {/* Days Schedule */}
        <div className="space-y-3">
          {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
            const dayNames = {
              monday: 'Lunes',
              tuesday: 'Martes',
              wednesday: 'Miércoles',
              thursday: 'Jueves',
              friday: 'Viernes',
              saturday: 'Sábado',
              sunday: 'Domingo'
            };

            const dayData = formData.openingHours?.[day] || { open: '09:00', close: '22:00', closed: false };

            return (
              <div key={day} className="bg-white/10 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Day Name and Closed Toggle */}
                  <div className="flex items-center gap-3 sm:w-40">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!dayData.closed}
                        onChange={(e) => {
                          const newHours = {
                            ...formData.openingHours,
                            [day]: { ...dayData, closed: !e.target.checked }
                          };
                          setFormData({ ...formData, openingHours: newHours });
                        }}
                        className="w-4 h-4 rounded border-2 border-white/50 bg-white/20 checked:bg-green-500"
                      />
                      <span className="text-white font-semibold">{dayNames[day]}</span>
                    </label>
                  </div>

                  {/* Time Inputs */}
                  {!dayData.closed ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1">
                        <label className="block text-xs text-white/70 mb-1">Abre</label>
                        <input
                          type="time"
                          value={dayData.open}
                          onChange={(e) => {
                            const newHours = {
                              ...formData.openingHours,
                              [day]: { ...dayData, open: e.target.value }
                            };
                            setFormData({ ...formData, openingHours: newHours });
                          }}
                          className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white"
                        />
                      </div>
                      <span className="text-white/70 mt-5">-</span>
                      <div className="flex-1">
                        <label className="block text-xs text-white/70 mb-1">Cierra</label>
                        <input
                          type="time"
                          value={dayData.close}
                          onChange={(e) => {
                            const newHours = {
                              ...formData.openingHours,
                              [day]: { ...dayData, close: e.target.value }
                            };
                            setFormData({ ...formData, openingHours: newHours });
                          }}
                          className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 py-2">
                      <span className="text-white/60 italic">Cerrado</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

        {/* Tamaño del logo */}
        {formData.logo && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ancho del logo (px)
              </label>
              <input
                type="number"
                value={formData.logoWidth || 120}
                onChange={(e) => setFormData({ ...formData, logoWidth: parseInt(e.target.value) || 120 })}
                min="40"
                max="300"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                placeholder="120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Alto del logo (px)
              </label>
              <input
                type="number"
                value={formData.logoHeight || 40}
                onChange={(e) => setFormData({ ...formData, logoHeight: parseInt(e.target.value) || 40 })}
                min="20"
                max="100"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                placeholder="40"
              />
            </div>
          </div>
        )}
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
      </div>

      {/* Gestión de Caché */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-white">Gestión de Caché</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h4 className="text-white font-medium mb-2">Estado del Caché</h4>
            <p className="text-sm text-gray-400 mb-3">
              El caché mejora el rendimiento guardando datos por 24 horas. Se actualiza automáticamente 
              cuando guardas cambios desde el panel admin.
            </p>
            
            {cacheInfo && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Última actualización:</span>
                  <span className="text-white font-medium">{formatTimeSince(cacheInfo.lastUpdate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Estado:</span>
                  <span className={`font-medium ${cacheInfo.isValid ? 'text-green-400' : 'text-yellow-400'}`}>
                    {cacheInfo.isValid ? '✓ Válido (< 24h)' : '⚠ Expirado (> 24h)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleInvalidateCache}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all hover:scale-105 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Forzar Actualización de Caché
          </button>
          <p className="text-xs text-gray-500">
            Usa esto si necesitas que los clientes vean los cambios inmediatamente sin esperar 24 horas.
          </p>
        </div>
      </div>

      {/* Zona de Peligro */}
      <div className="bg-red-900/20 rounded-2xl p-6 border-2 border-red-500/50">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-semibold text-red-400">Zona de Peligro</h3>
        </div>
        <div className="space-y-4">
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
    </div>
  );
};
