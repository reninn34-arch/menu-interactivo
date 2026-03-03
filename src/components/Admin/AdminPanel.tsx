import { useState, ElementType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Salad, X, Settings, FolderOpen, Package, Sliders, Store, Palette } from 'lucide-react';
import { IngredientEditor } from './IngredientEditor';
import { SiteConfigEditor } from './SiteConfigEditor';
import { CategoryEditor } from './CategoryEditor';
import { ProductEditor } from './ProductEditor';
import { OptionGroupEditor } from './OptionGroupEditor';
import { useMenu } from '../../contexts/MenuContext';

interface AdminPanelProps {
  onClose: () => void;
}

type TabType = 'settings' | 'categories' | 'products' | 'options' | 'ingredients';

interface TabConfig {
  id: TabType;
  label: string;
  icon: ElementType;
  description: string;
  color: string;
  group: 'config' | 'menu';
}

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const { products, categories, optionGroups, ingredients } = useMenu();

  const tabs: TabConfig[] = [
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      description: 'Nombre, logo, colores del sitio',
      color: 'from-blue-500 to-blue-600',
      group: 'config'
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: FolderOpen,
      description: 'Organiza tu menú en secciones',
      color: 'from-purple-500 to-purple-600',
      group: 'menu'
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      description: 'Gestiona tu catálogo completo',
      color: 'from-orange-500 to-orange-600',
      group: 'menu'
    },
    {
      id: 'options',
      label: 'Opciones',
      icon: Sliders,
      description: 'Tamaños, extras, carnes y complementos',
      color: 'from-green-500 to-green-600',
      group: 'menu'
    },
    {
      id: 'ingredients',
      label: 'Ingredientes',
      icon: Salad,
      description: 'Ingredientes visuales del burger',
      color: 'from-emerald-500 to-emerald-600',
      group: 'menu'
    }
  ];

  const activeTabConfig = tabs.find(t => t.id === activeTab);

  const getCount = (tabId: TabType) => {
    switch (tabId) {
      case 'products': return products.filter(p => p.enabled).length;
      case 'categories': return categories.filter(c => c.enabled).length;
      case 'options': return optionGroups.filter(g => g.enabled).length;
      case 'ingredients': return ingredients.filter(i => i.enabled).length;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-black/90 via-black/85 to-black/90 backdrop-blur-md z-50 overflow-hidden"
    >
      <div className="h-screen flex flex-col">
        {/* Header Mobile/Desktop */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800 shrink-0">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Store className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base md:text-lg font-bold text-white">Admin Panel</h1>
                  <p className="text-xs text-gray-400 hidden md:block">Panel de Control</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors group"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Tabs Horizontales - Solo Mobile */}
          <div className="md:hidden px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Solo Desktop */}
          <div className="hidden md:flex w-80 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 flex-col shrink-0">
            {/* Navigation - Configuración */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Configuración
                </h3>
                <div className="space-y-1">
                  {tabs.filter(tab => tab.group === 'config').map((tab) => {
                    const Icon = tab.icon;
                    const count = getCount(tab.id);
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ x: isActive ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group ${
                          isActive
                            ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                            {tab.description}
                          </div>
                        </div>
                        {count !== null && (
                          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {count}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation - Menú */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Gestión del Menú
                </h3>
                <div className="space-y-1">
                  {tabs.filter(tab => tab.group === 'menu').map((tab) => {
                    const Icon = tab.icon;
                    const count = getCount(tab.id);
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ x: isActive ? 0 : 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group ${
                          isActive
                            ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{tab.label}</div>
                          <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
                            {tab.description}
                          </div>
                        </div>
                        {count !== null && (
                          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-400'
                          }`}>
                            {count}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-2 py-2 bg-gray-800/50 rounded-lg">
                <Palette className="w-5 h-5 text-orange-500" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">Quick Stats</div>
                  <div className="text-xs text-gray-500">
                    {products.filter(p => p.enabled).length} productos activos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
              {/* Content Header - Solo Desktop */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 md:mb-6 hidden md:block"
              >
                <div className="flex items-center gap-3 mb-2">
                  {activeTabConfig && (
                    <>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeTabConfig.color} flex items-center justify-center shadow-lg`}>
                        <activeTabConfig.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{activeTabConfig.label}</h2>
                        <p className="text-sm text-gray-400">{activeTabConfig.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Content Area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-900/50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-800/50"
                >
                  {activeTab === 'settings' && <SiteConfigEditor />}
                  {activeTab === 'categories' && <CategoryEditor />}
                  {activeTab === 'products' && <ProductEditor />}
                  {activeTab === 'options' && <OptionGroupEditor />}
                  {activeTab === 'ingredients' && <IngredientEditor />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
