import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Palette, AlertTriangle, Lock, RefreshCw, Check, X, Shield, Settings, ChevronDown, ChevronRight, MessageCircle, Clock, Globe, Smartphone } from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageUploader } from './ImageUploader';
import { useConfirm, ConfirmModal } from './ConfirmModal';
import { authApi } from '../../services/api';

const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'localStorage';

export const SiteConfigEditor = () => {
  const { siteConfig, updateSiteConfig, resetToDefaults, invalidateCache } = useMenu();
  const { adminPassword, setAdminPassword, username, setUsername } = useAuth();
  const [formData, setFormData] = useState(siteConfig);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const { confirm, close: closeConfirm, state: confirmState } = useConfirm();

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    whatsapp: true,
    social: false,
    hours: true,
    siteInfo: true,
    appearance: false,
  });

  const toggleSection = (s: string) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));

  const CollapsibleSection = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="border-2 border-gray-700/50 rounded-2xl overflow-hidden transition-all hover:border-gray-600/50">
      <button onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-gray-800/60 hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-orange-400" />
          </div>
          <span className="text-white font-bold">{title}</span>
        </div>
        {expandedSections[id] ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      <AnimatePresence>
        {expandedSections[id] && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-5 border-t-2 border-gray-700/50 bg-gray-900/30">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  useEffect(() => { setFormData(siteConfig); }, [siteConfig]);

  const handleSave = () => { updateSiteConfig(formData); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const colorPresets = [
    { name: 'Naranja (Default)', primary: '#FF9F0A', secondary: '#FF7A00', accent: '#FFD700' },
    { name: 'Rojo Pasion', primary: '#DC2626', secondary: '#991B1B', accent: '#FCA5A5' },
    { name: 'Azul Oceano', primary: '#0EA5E9', secondary: '#0369A1', accent: '#7DD3FC' },
    { name: 'Verde Fresco', primary: '#10B981', secondary: '#047857', accent: '#6EE7B7' },
    { name: 'Purpura Real', primary: '#8B5CF6', secondary: '#6D28D9', accent: '#C4B5FD' },
  ];

  // Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [credentialsError, setCredentialsError] = useState('');
  const [isUpdatingCredentials, setIsUpdatingCredentials] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!currentPassword) { setPasswordValid(null); return; }
    if (STORAGE_MODE !== 'api') { setPasswordValid(currentPassword === adminPassword); return; }
    setIsVerifyingPassword(true);
    const t = setTimeout(async () => {
      try { const r = await authApi.verifyPassword(currentPassword); setPasswordValid(r.valid); }
      catch { setPasswordValid(false); }
      finally { setIsVerifyingPassword(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [currentPassword, adminPassword]);

  const handleCredentialsChange = async () => {
    setCredentialsError('');
    if (!newUsername && !newPassword) { setCredentialsError('Debes ingresar un nuevo usuario y/o contrasena'); return; }
    if (!currentPassword) { setCredentialsError('Ingresa tu contrasena actual'); return; }
    if (newPassword && newPassword.length < 6) { setCredentialsError('La contrasena debe tener al menos 6 caracteres'); return; }
    if (newPassword && newPassword !== confirmPassword) { setCredentialsError('Las contrasenas no coinciden'); return; }
    if (newUsername && newUsername.length < 3) { setCredentialsError('El usuario debe tener al menos 3 caracteres'); return; }
    setIsUpdatingCredentials(true);
    try {
      if (STORAGE_MODE === 'api') {
        const r = await authApi.updateCredentials(currentPassword, newUsername || undefined, newPassword || undefined);
        if (newUsername) setUsername(r.user.username);
      } else {
        if (currentPassword !== adminPassword) { setCredentialsError('Contrasena actual incorrecta'); setIsUpdatingCredentials(false); return; }
        if (newPassword) setAdminPassword(newPassword);
        if (newUsername) setUsername(newUsername);
      }
      setCredentialsSaved(true);
      setCurrentPassword(''); setPasswordValid(null); setNewUsername(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setCredentialsSaved(false), 3000);
    } catch (e) {
      setCredentialsError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setIsUpdatingCredentials(false);
    }
  };

  const handleReset = () => {
    confirm({
      title: 'Resetear Todos los Datos',
      message: 'Esto eliminara TODOS los cambios (productos, categorias, imagenes, configuracion) y restaurara los valores por defecto. Esta accion NO se puede deshacer.',
      type: 'danger',
      onConfirm: resetToDefaults
    });
  };

  const handleInvalidateCache = () => {
    confirm({
      title: 'Forzar Actualizacion de Cache',
      message: 'Esto hara que los clientes vean los cambios mas recientes en su proxima visita. Continuar?',
      type: 'info',
      onConfirm: invalidateCache
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Configuracion del Sitio</h2>
          <p className="text-gray-400 text-sm mt-1">Personaliza la apariencia y funcionamiento de tu menu digital</p>
        </div>
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
            saved ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25'
          }`}>
          <Save className="w-5 h-5" /> {saved ? 'Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-2xl">
        <button onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'general' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}>
          <Settings className="w-5 h-5" /> General
        </button>
        <button onClick={() => setActiveTab('security')}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'security' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'
          }`}>
          <Shield className="w-5 h-5" /> Seguridad
        </button>
      </div>

      {/* PESTANA GENERAL */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          {/* WhatsApp y Direccion */}
          <CollapsibleSection id="whatsapp" title="WhatsApp y Direccion" icon={MessageCircle}>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-500/20 rounded-xl p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-1.5">WhatsApp para RECOGER en Tienda</label>
                  <input type="text" value={formData.whatsappNumberPickup || ''} onChange={(e) => setFormData({ ...formData, whatsappNumberPickup: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Ej: 593987654321" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1.5">WhatsApp para DELIVERY</label>
                  <input type="text" value={formData.whatsappNumberDelivery || ''} onChange={(e) => setFormData({ ...formData, whatsappNumberDelivery: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="Ej: 593998765432" />
                  <p className="text-xs text-gray-500 mt-1">Formato Ecuador: 593 + 9 digitos</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1.5">Direccion del Restaurante</label>
                  <textarea value={formData.restaurantAddress || ''} onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 resize-none"
                    placeholder="Ej: Av. 9 de Octubre, Guayaquil" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1.5">Costo de Delivery ($)</label>
                  <input type="number" step="0.01" min="0" value={formData.deliveryCost || 0} onChange={(e) => setFormData({ ...formData, deliveryCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Horarios */}
          <CollapsibleSection id="hours" title="Horarios de Operacion" icon={Clock}>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.allowOrdersOutsideHours || false} onChange={(e) => setFormData({ ...formData, allowOrdersOutsideHours: e.target.checked })}
                    className="mt-0.5 w-5 h-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500" />
                  <div>
                    <span className="text-white font-semibold">Permitir pedidos fuera de horario</span>
                    <p className="text-xs text-gray-400 mt-0.5">Los clientes podran hacer pedidos incluso cuando el restaurante este cerrado</p>
                  </div>
                </label>
              </div>
              <div className="space-y-2">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map(day => {
                  const names: Record<string, string> = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miercoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sabado', sunday: 'Domingo' };
                  const dd = formData.openingHours?.[day] || { open: '09:00', close: '22:00', closed: false };
                  return (
                    <div key={day} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl border border-gray-700">
                      <label className="flex items-center gap-2 cursor-pointer w-28">
                        <input type="checkbox" checked={!dd.closed} onChange={(e) => setFormData({ ...formData, openingHours: { ...formData.openingHours, [day]: { ...dd, closed: !e.target.checked } } })}
                          className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-green-500" />
                        <span className="text-sm text-white font-medium">{names[day]}</span>
                      </label>
                      {!dd.closed ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={dd.open} onChange={(e) => setFormData({ ...formData, openingHours: { ...formData.openingHours, [day]: { ...dd, open: e.target.value } } })}
                            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" />
                          <span className="text-gray-500">-</span>
                          <input type="time" value={dd.close} onChange={(e) => setFormData({ ...formData, openingHours: { ...formData.openingHours, [day]: { ...dd, close: e.target.value } } })}
                            className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Cerrado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CollapsibleSection>

          {/* Redes Sociales */}
          <CollapsibleSection id="social" title="Redes Sociales" icon={Globe}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['instagram', 'facebook', 'tiktok'] as const).map(network => (
                <div key={network}>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 capitalize">{network}</label>
                  <input type="url" value={formData[network] || ''} onChange={(e) => setFormData({ ...formData, [network]: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder={`https://${network}.com/tuusuario`} autoComplete="off" />
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Informacion del Sitio */}
          <CollapsibleSection id="siteInfo" title="Informacion del Sitio" icon={Smartphone}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Nombre del Sitio</label>
                  <input type="text" value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Ej: Burger House" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Sucursal</label>
                  <input type="text" value={formData.branchName} onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Ej: Sucursal Centro" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Eslogan</label>
                  <input type="text" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Ej: Las mejores hamburguesas de la ciudad" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Moneda</label>
                  <select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20">
                    <option value="USD">Dolar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="MXN">Peso Mexicano (MXN)</option>
                    <option value="COP">Peso Colombiano (COP)</option>
                    <option value="ARS">Peso Argentino (ARS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Simbolo de Moneda</label>
                  <input type="text" value={formData.currencySymbol} onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="$" />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <ImageUploader currentImage={formData.logo} onImageChange={(url) => setFormData({ ...formData, logo: url })}
                  label="Logo del Sitio" />
                <ImageUploader currentImage={formData.faviconUrl} onImageChange={(url) => setFormData({ ...formData, faviconUrl: url })}
                  label="Favicon" />
                <p className="text-xs text-yellow-400/80">El favicon debe ser cuadrado (ideal: 192x192 px, PNG).</p>
              </div>

              {formData.logo && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Ancho Logo (px)</label>
                    <input type="number" value={formData.logoWidth || 120} onChange={(e) => setFormData({ ...formData, logoWidth: parseInt(e.target.value) || 120 })}
                      min="40" max="300" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Alto Logo (px)</label>
                    <input type="number" value={formData.logoHeight || 40} onChange={(e) => setFormData({ ...formData, logoHeight: parseInt(e.target.value) || 40 })}
                      min="20" max="100" className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500" />
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Apariencia */}
          <CollapsibleSection id="appearance" title="Apariencia y Colores" icon={Palette}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Paletas Predefinidas</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {colorPresets.map(preset => (
                    <button key={preset.name} onClick={() => setFormData({ ...formData, primaryColor: preset.primary, secondaryColor: preset.secondary, accentColor: preset.accent })}
                      className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-left border border-gray-600 hover:border-orange-500/50">
                      <div className="flex gap-1 mb-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <p className="text-xs text-gray-300 leading-tight">{preset.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'] as const).map(field => {
                  const labels: Record<string, string> = { primaryColor: 'Color Principal', secondaryColor: 'Secundario', accentColor: 'Acento', backgroundColor: 'Fondo', textColor: 'Texto' };
                  return (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">{labels[field]}</label>
                      <div className="flex gap-2">
                        <input type="color" value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-600 bg-transparent" />
                        <input type="text" value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-orange-500" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="mt-4 p-6 rounded-2xl border border-gray-700" style={{ backgroundColor: formData.backgroundColor }}>
                <h4 className="text-lg font-semibold mb-4" style={{ color: formData.textColor }}>Vista Previa del Tema</h4>
                <button className="px-6 py-3 rounded-full font-bold text-white transition-all hover:scale-105"
                  style={{ background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.secondaryColor})` }}>
                  Boton de Ejemplo
                </button>
                <p className="mt-3 text-sm" style={{ color: formData.accentColor }}>Texto de acento · {formData.currencySymbol}12.99</p>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* PESTANA SEGURIDAD */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          {/* Credenciales */}
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-6 border-2 border-orange-500/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Credenciales de Admin</h4>
                <p className="text-sm text-orange-200/70">{STORAGE_MODE === 'api' ? 'Backend API' : 'Almacenamiento local'}</p>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-5">
              <h5 className="text-sm font-semibold text-orange-300 mb-3">Credenciales Actuales:</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Usuario:</span>
                  <code className="px-3 py-1 bg-gray-800 rounded-lg text-orange-400 font-mono">{username || 'admin'}</code></div>
                <div className="flex justify-between"><span className="text-gray-400">Contrasena:</span>
                  <code className="px-3 py-1 bg-gray-800 rounded-lg text-orange-400 font-mono">{'•'.repeat(STORAGE_MODE === 'api' ? 8 : adminPassword.length)}</code></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-1.5">Contrasena Actual <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input type="password" value={currentPassword} onChange={(e) => { setCurrentPassword(e.target.value); setCredentialsError(''); }}
                    className={`w-full px-4 py-3 pr-12 bg-gray-800/80 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                      passwordValid === null ? 'border-gray-600 focus:border-orange-500 focus:ring-orange-500/20' :
                      passwordValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' :
                      'border-red-500 focus:border-red-500 focus:ring-red-500/20'}`}
                    placeholder="Ingresa tu contrasena actual" />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isVerifyingPassword ? <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" /> :
                     passwordValid === true ? <Check className="w-5 h-5 text-green-500" /> :
                     passwordValid === false ? <X className="w-5 h-5 text-red-500" /> : null}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-1.5">Nuevo Usuario (opcional)</label>
                <input type="text" value={newUsername} onChange={(e) => { setNewUsername(e.target.value); setCredentialsError(''); }}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Dejar vacio para mantener actual" />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-1.5">Nueva Contrasena (opcional)</label>
                <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setCredentialsError(''); }}
                  className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Dejar vacio para mantener actual" />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-1.5">Confirmar Contrasena</label>
                <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setCredentialsError(''); }}
                  disabled={!newPassword} className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>

              {credentialsError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-sm text-red-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {credentialsError}</p>
                </div>
              )}

              {newPassword && newPassword !== confirmPassword && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                  <p className="text-sm text-yellow-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Las contrasenas no coinciden</p>
                </div>
              )}

              <button onClick={handleCredentialsChange}
                disabled={isUpdatingCredentials || (!newUsername && !newPassword) || (newPassword && newPassword !== confirmPassword) || !currentPassword || passwordValid !== true}
                className={`w-full px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  credentialsSaved ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                {isUpdatingCredentials && <RefreshCw className="w-5 h-5 animate-spin" />}
                {credentialsSaved ? '✓ Credenciales Actualizadas' : isUpdatingCredentials ? 'Actualizando...' : 'Actualizar Credenciales'}
              </button>
            </div>
          </div>

          {/* Cache */}
          <div className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-bold">Gestion de Cache</h4>
                <p className="text-sm text-gray-400">El cache mejora el rendimiento guardando datos por 24h</p>
              </div>
            </div>
            <button onClick={handleInvalidateCache}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Forzar Actualizacion de Cache
            </button>
          </div>

          {/* Zona de Peligro */}
          <div className="bg-red-900/10 rounded-2xl p-6 border-2 border-red-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-red-400 font-bold">Zona de Peligro</h4>
                <p className="text-sm text-red-300/70">Acciones irreversibles</p>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 border border-red-500/20">
              <h4 className="text-white font-medium mb-2">Resetear Todos los Datos</h4>
              <p className="text-sm text-gray-400 mb-4">
                Eliminara <strong className="text-red-400">todos los cambios</strong> (productos, categorias, imagenes, configuracion) y restaurara valores por defecto.
              </p>
              <button onClick={handleReset}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all">
                Resetear a Valores por Defecto
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirm} onConfirm={confirmState.onConfirm}
        title={confirmState.title} message={confirmState.message} type={confirmState.type} />
    </div>
  );
};
