import { motion } from 'motion/react';
import { 
  Package, 
  FolderOpen, 
  Salad, 
  Sliders, 
  Eye, 
  Star, 
  Zap, 
  Plus,
  PlusCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  Settings,
  Leaf
} from 'lucide-react';
import { useMenu } from '../../contexts/MenuContext';
import { useSiteEffects } from '../../hooks/useSiteEffects';

interface DashboardProps {
  onNavigate: (tab: 'dashboard' | 'settings' | 'categories' | 'products' | 'options' | 'ingredients') => void;
  onOpenPreview: () => void;
  onOpenWizard: () => void;
}

export const Dashboard = ({ onNavigate, onOpenPreview, onOpenWizard }: DashboardProps) => {
  const { products, categories, ingredients, optionGroups, siteConfig } = useMenu();

  const activeProducts = products.filter(p => p.enabled).length;
  const inactiveProducts = products.filter(p => !p.enabled).length;
  const featuredProducts = products.filter(p => p.featured && p.enabled).length;
  const layeredProducts = products.filter(p => p.useLayeredView && p.enabled).length;
  const inStockProducts = products.filter(p => p.inStock !== false && p.enabled).length;
  const outOfStockProducts = products.filter(p => p.inStock === false && p.enabled).length;

  const activeCategories = categories.filter(c => c.enabled).length;
  const activeIngredients = ingredients.filter(i => i.enabled).length;
  const activeOptions = optionGroups.filter(g => g.enabled).length;

  const quickActions = [
    { 
      id: 'products', 
      icon: Package, 
      label: 'Crear Producto', 
      description: 'Agregar nuevo item al menú',
      color: 'from-orange-500 to-orange-600',
      action: onOpenWizard
    },
    { 
      id: 'categories', 
      icon: FolderOpen, 
      label: 'Crear Categoría', 
      description: 'Nueva sección del menú',
      color: 'from-purple-500 to-purple-600',
      action: () => onNavigate('categories')
    },
    { 
      id: 'preview', 
      icon: Eye, 
      label: 'Ver Menú', 
      description: 'Vista previa del cliente',
      color: 'from-blue-500 to-blue-600',
      action: onOpenPreview
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Configuración', 
      description: 'Ajustes del sitio',
      color: 'from-gray-500 to-gray-600',
      action: () => onNavigate('settings')
    },
  ];

  const featuredProductCards = products
    .filter(p => p.featured && p.enabled)
    .slice(0, 4)
    .map(product => {
      const category = categories.find(c => c.id === product.categoryId);
      return { ...product, categoryName: category?.name || 'Sin categoría' };
    });

  const layeredProductCards = products
    .filter(p => p.useLayeredView && p.enabled)
    .slice(0, 4);

  const StatCard = ({ 
    icon: Icon, 
    label, 
    value, 
    subValue, 
    color, 
    onClick 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string | number; 
    subValue?: string;
    color: string;
    onClick?: () => void;
  }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all text-left group`}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
      </div>
      <div className="mt-2 h-0.5 w-full bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </motion.button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            Bienvenido a <span className="text-orange-400 font-medium">{siteConfig.siteName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-400 font-medium">Sistema Activo</span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.action}
              className={`p-5 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg hover:shadow-xl transition-all group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Icon className="w-6 h-6 text-white mb-3" />
              <h3 className="text-white font-semibold text-sm">{action.label}</h3>
              <p className="text-white/70 text-xs mt-1">{action.description}</p>
              <ArrowRight className="w-4 h-4 text-white/50 absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard 
          icon={Package} 
          label="Productos" 
          value={activeProducts}
          subValue={`/ ${products.length} total`}
          color="from-orange-500 to-orange-600"
          onClick={() => onNavigate('products')}
        />
        <StatCard 
          icon={FolderOpen} 
          label="Categorías" 
          value={activeCategories}
          subValue={`/ ${categories.length}`}
          color="from-purple-500 to-purple-600"
          onClick={() => onNavigate('categories')}
        />
        <StatCard 
          icon={Salad} 
          label="Ingredientes" 
          value={activeIngredients}
          subValue={`/ ${ingredients.length}`}
          color="from-emerald-500 to-emerald-600"
          onClick={() => onNavigate('ingredients')}
        />
        <StatCard 
          icon={Sliders} 
          label="Opciones" 
          value={activeOptions}
          subValue={`/ ${optionGroups.length}`}
          color="from-blue-500 to-blue-600"
          onClick={() => onNavigate('options')}
        />
      </motion.div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400 text-xs uppercase">Destacados</span>
          </div>
          <p className="text-2xl font-bold text-white">{featuredProducts}</p>
          <p className="text-xs text-gray-500 mt-1">productos activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs uppercase">Vista 3D</span>
          </div>
          <p className="text-2xl font-bold text-white">{layeredProducts}</p>
          <p className="text-xs text-gray-500 mt-1">con capas animadas</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs uppercase">En Stock</span>
          </div>
          <p className="text-2xl font-bold text-white">{inStockProducts}</p>
          <p className="text-xs text-gray-500 mt-1">disponibles</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-gray-400 text-xs uppercase">Sin Stock</span>
          </div>
          <p className="text-2xl font-bold text-white">{outOfStockProducts}</p>
          <p className="text-xs text-gray-500 mt-1">no disponibles</p>
        </motion.div>
      </div>

      {/* Featured & 3D Products */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Featured Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gray-800/30 rounded-2xl border border-gray-700/30 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Productos Destacados
            </h3>
            <button 
              onClick={() => onNavigate('products')}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {featuredProductCards.length > 0 ? (
            <div className="space-y-3">
              {featuredProductCards.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('products')}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-600 overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-gray-400 text-xs">{product.categoryName}</p>
                  </div>
                  <div className="text-orange-400 font-bold text-sm">
                    {siteConfig.currencySymbol}{product.price.toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No hay productos destacados</p>
            </div>
          )}
        </motion.div>

        {/* 3D Layered Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800/30 rounded-2xl border border-gray-700/30 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Productos con Vista 3D
            </h3>
            <button 
              onClick={() => onNavigate('products')}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {layeredProductCards.length > 0 ? (
            <div className="space-y-3">
              {layeredProductCards.map((product, index) => {
                const category = categories.find(c => c.id === product.categoryId);
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate('products')}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{product.name}</h4>
                      <p className="text-gray-400 text-xs">{category?.name || 'Sin categoría'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {product.ingredientIds?.length && (
                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">
                          {product.ingredientIds.length} capas
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No hay productos con vista 3D</p>
              <button 
                onClick={() => onNavigate('products')}
                className="text-xs text-orange-400 hover:text-orange-300 mt-2"
              >
                Crear primer producto 3D
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Config Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/30 p-5"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Estado de Configuración
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Información básica', done: !!siteConfig.siteName },
            { label: 'WhatsApp configurado', done: !!siteConfig.whatsappNumberPickup },
            { label: 'Horarios configurados', done: !!siteConfig.openingHours },
            { label: 'Logo subido', done: !!siteConfig.logo },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-600'}`}>
                {item.done && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm ${item.done ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};