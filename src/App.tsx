import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ShoppingCart, Menu, X, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Burger } from './components/Burger';
import { MeatSelector } from './components/MeatSelector';
import { CategorySelector } from './components/CategorySelector';
import { ProductCard } from './components/ProductCard';
import { InteractiveProductView } from './components/InteractiveProductView';
import { NutritionalInfo } from './components/NutritionalInfo';
import { OrderButton } from './components/OrderButton';
import { AdminPanel } from './components/Admin';
import { AdminLogin } from './components/AdminLogin';
import { Cart } from './components/Cart';
import { ProductOptionsModal } from './components/ProductOptionsModal';
import { useMenu } from './contexts/MenuContext';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import { isRestaurantOpen, getScheduleDisplay } from './utils/openingHours';

export default function App() {
  // TODOS LOS HOOKS VAN AL INICIO
  const { products, categories, optionGroups, siteConfig, isLoading, error } = useMenu();
  const { itemCount, addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [meatIndex, setMeatIndex] = useState(0);
  const [prevMeatIndex, setPrevMeatIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMeatSelector, setShowMeatSelector] = useState(false);
  const [meatSelected, setMeatSelected] = useState(false);
  const [showBurgerOptions, setShowBurgerOptions] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (siteConfig.faviconUrl) {
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteConfig.faviconUrl;
    } else {
      if (link) {
        link.remove();
      }
    }
  }, [siteConfig.faviconUrl]);

  useEffect(() => {
    if (siteConfig.siteName) {
      document.title = siteConfig.siteName;
    }
  }, [siteConfig.siteName]);

  // Forzar la selección de la categoría principal al cargar si la actual no existe
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === selectedCategoryId)) {
      const fallbackCat = categories.find(c => c.isMain) || categories[0];
      setSelectedCategoryId(fallbackCat ? fallbackCat.id : '');
      setSelectedProductIndex(0);
    }
  }, [categories, selectedCategoryId]);

  // (El useEffect de selección de categoría principal se movió arriba)

  // Loading state y error state DESPUÉS de los hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A1410] via-[#2D0D0A] to-[#0A0604] flex items-center justify-center">
        <div className="text-center">
          <Loader2 
            className="w-12 h-12 animate-spin mx-auto mb-4" 
            style={{ color: siteConfig?.primaryColor || '#FF9F0A' }}
          />
          <p className="text-white text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4A1410] via-[#2D0D0A] to-[#0A0604] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Error al cargar datos</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white rounded-lg transition-colors"
            style={{
              background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Restaurant status
  const restaurantStatus = isRestaurantOpen(siteConfig);

  // Solo permitir acceso al admin si está autenticado
  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    }
  };
  

  // Filtrar productos por categoría seleccionada
  const categoryProducts = products.filter(p => p.enabled && p.categoryId === selectedCategoryId);
  const selectedProduct = categoryProducts[selectedProductIndex] || categoryProducts[0];
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  // Obtener carnes desde el grupo de opciones vinculado dinámicamente al producto
  const linkedGroupId = selectedProduct?.linkedOptionGroupId || 'meat-type';
  const meatOptionGroup = optionGroups.find(g => g.id === linkedGroupId);
  
  const meats = meatOptionGroup?.values.filter(v => v.enabled).map(v => ({
    id: v.id,
    name: v.name,
    shortName: v.name,
    style: v.style || 'from-gray-600 to-gray-800',
    price: v.priceModifier,
    calories: v.calories || 0,
    protein: v.protein || 0,
    fat: v.fat || 0,
    carbs: v.carbs || 0,
    image: v.image,
  })) || [];

  // Evitar errores si no hay carnes configuradas
  const fallbackMeat = { id: 'none', name: 'Original', shortName: '', style: '', price: 0, calories: 0, protein: 0, fat: 0, carbs: 0 };
  const selectedMeat = meats[meatIndex] || meats[0] || fallbackMeat;

  // (El useEffect de selección de categoría principal está arriba, junto a los demás hooks)

  // Detectar si la categoría actual es la Principal (marcada en Admin)
  const isBurgerCategory = selectedCategory?.isMain === true;

  // Determinar si mostrar vista interactiva
  const hasInteractiveProducts = categoryProducts.some(p => p.optionGroupIds && p.optionGroupIds.length > 0);
  const showInteractiveView = !isBurgerCategory && hasInteractiveProducts;

  const handleMeatChange = (newIndex: number) => {
    setPrevMeatIndex(meatIndex);
    setMeatIndex(newIndex);
    
    // Separar hamburguesa al cambiar carne
    setIsCollapsed(false);
    
    // Juntar después de 800ms
    setTimeout(() => {
      setIsCollapsed(true);
    }, 800);
  };

  const direction = meatIndex > prevMeatIndex ? 1 : -1;

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedProductIndex(0); // Reset product selection when changing category
  };

  return (
    <>
      {/* Mostrar AdminLogin si intenta acceder sin autenticar */}
      {showAdmin && !isAuthenticated && (
        <div className="fixed inset-0 z-50">
          <AdminLogin />
          <button
            onClick={() => setShowAdmin(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors z-10"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mostrar AdminPanel solo si está autenticado */}
      {showAdmin && isAuthenticated && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />

      {/* Sidebar lateral para categ orías */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ 
                type: "tween", 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="fixed left-0 top-0 bottom-0 w-72 border-r border-white/10 z-50 overflow-y-auto"
              style={{ 
                willChange: 'transform',
                background: `linear-gradient(to bottom, ${siteConfig.backgroundColor || '#111827'}, ${siteConfig.backgroundColor ? `${siteConfig.backgroundColor}DD` : '#000000'})`
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-white">Menú</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setShowSidebar(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: selectedCategoryId === category.id
                          ? `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`
                          : 'rgba(255,255,255,0.05)',
                        color: selectedCategoryId === category.id ? '#FFF' : '#D1D5DB',
                        boxShadow: selectedCategoryId === category.id ? '0 10px 15px -3px rgba(0,0,0,0.3)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCategoryId !== category.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCategoryId !== category.id) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }
                      }}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{category?.name}</div>
                        {category.description && (
                          <div className="text-xs opacity-75 line-clamp-1">{category.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div 
        className="min-h-screen font-sans flex flex-col overflow-hidden relative"
        style={{ 
          background: `linear-gradient(to bottom right, ${siteConfig.backgroundColor || '#320A0A'}, #0A0604)`,
          color: siteConfig.textColor || '#FFFFFF'
        }}
      >
        
        {/* Decorative gradient overlay - Opcional */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-[#6B1F1A]/20 via-transparent to-black/40 pointer-events-none" /> */}
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 z-20 max-w-7xl mx-auto w-full relative">
          {/* Botón de menú hamburguesa */}
          <button
            onClick={() => setShowSidebar(true)}
            aria-label="Abrir menú de navegación"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" aria-hidden="true" />
          </button>

          {/* Logo del restaurante */}
          {siteConfig.logo ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <img
                src={siteConfig.logo}
                alt={siteConfig.siteName}
                style={{
                  width: siteConfig.logoWidth ? `${siteConfig.logoWidth}px` : '120px',
                  height: siteConfig.logoHeight ? `${siteConfig.logoHeight}px` : '40px',
                  objectFit: 'contain'
                }}
                className="drop-shadow-lg"
              />
            </div>
          ) : (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <h1 className="text-white font-bold text-lg sm:text-xl drop-shadow-lg">
                {siteConfig.siteName}
              </h1>
            </div>
          )}
          
          {/* Carrito */}
          <button
            onClick={() => setShowCart(true)}
            aria-label={`Abrir carrito de compras, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-white" aria-hidden="true" />
            {itemCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center"
                style={{ backgroundColor: siteConfig.primaryColor || '#FF9F0A' }}
                aria-live="polite"
              >
                {itemCount}
              </span>
            )}
          </button>
        </header>

        {/* Restaurant Status Banner - Solo mostrar cuando está CERRADO */}
        {siteConfig.openingHours && !restaurantStatus.isOpen && (
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 mb-2 sm:mb-4 z-20 relative">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl p-3 sm:p-4 backdrop-blur-md border bg-red-500/20 border-red-500/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                <div>
                  <p className="font-bold text-sm sm:text-base text-red-400">
                    ❌ Cerrado
                  </p>
                  <p className="text-xs sm:text-sm text-white/80">
                    {restaurantStatus.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="text-xs sm:text-sm text-white/70 hover:text-white transition-colors underline"
              >
                Ver horarios
              </button>
            </motion.div>
          </div>
        )}

        {/* Schedule Modal */}
        <AnimatePresence>
          {showScheduleModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowScheduleModal(false)}
                className="fixed inset-0 bg-black/60 z-50"
              />
              
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-gray-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Clock 
                        className="w-6 h-6" 
                        style={{ color: siteConfig.primaryColor || '#FF9F0A' }}
                      />
                      Horarios de Atención
                    </h3>
                    <button
                      onClick={() => setShowScheduleModal(false)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {getScheduleDisplay(siteConfig).map((daySchedule, index) => {
                      const [dayName, hours] = daySchedule.split(': ');
                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                        >
                          <span className="text-white font-medium">{dayName}</span>
                          <span className="text-gray-400">{hours}</span>
                        </div>
                      );
                    })}
                  </div>

                  {siteConfig.allowOrdersOutsideHours && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400 text-center">
                        ✅ Pedidos disponibles 24/7
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 pb-2 sm:pb-8 relative">
          {/* Vista de Hamburguesas */}
          {isBurgerCategory && selectedProduct ? (
            <div className="z-20 w-full">
              
              {/* ✨ Selector de productos - Carrusel en móvil, botones en desktop ✨ */}
              {categoryProducts.length > 0 && (
                <>
                  {/* Desktop: Botones horizontales */}
                  <div className="hidden md:flex gap-2 lg:gap-3 pb-2 lg:pb-4 mb-4 lg:mb-6 justify-center flex-wrap">
                    {categoryProducts.map((prod, index) => (
                      <button
                        key={prod.id}
                        onClick={() => setSelectedProductIndex(index)}
                        className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all"
                        style={selectedProductIndex === index ? {
                          background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                          color: '#FFFFFF',
                          boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                        } : {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#D1D5DB'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedProductIndex !== index) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedProductIndex !== index) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }
                        }}
                      >
                        {prod?.name}
                      </button>
                    ))}
                  </div>

                  {/* Móvil: Carrusel con drag */}
                  <div className="md:hidden mb-4">
                    <div className="relative overflow-hidden">
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipe = Math.abs(offset.x) * velocity.x;
                          if (swipe < -500 && selectedProductIndex < categoryProducts.length - 1) {
                            setSelectedProductIndex(selectedProductIndex + 1);
                          } else if (swipe > 500 && selectedProductIndex > 0) {
                            setSelectedProductIndex(selectedProductIndex - 1);
                          }
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <motion.div
                          key={selectedProductIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex justify-center px-4"
                        >
                          <div 
                            className="text-white px-6 py-3 rounded-xl text-center font-medium max-w-full"
                            style={{
                              background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                              boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                            }}
                          >
                            {categoryProducts[selectedProductIndex]?.name}
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                    {/* Indicadores de carrusel */}
                    <div className="flex justify-center gap-1.5 mt-3">
                      {categoryProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedProductIndex(index)}
                          className="h-1.5 rounded-full transition-all"
                          style={selectedProductIndex === index ? {
                            width: '1.5rem',
                            backgroundColor: siteConfig.primaryColor || '#FF9F0A'
                          } : {
                            width: '0.375rem',
                            backgroundColor: '#4B5563'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedProductIndex !== index) {
                              e.currentTarget.style.backgroundColor = '#6B7280';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedProductIndex !== index) {
                              e.currentTarget.style.backgroundColor = '#4B5563';
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* El contenedor original de la hamburguesa */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-8 xl:gap-16">
                {/* Burger Visualization */}
                <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-end py-0 lg:py-8 z-10 min-h-[160px] lg:min-h-[400px]">
                  <Burger 
                    isCollapsed={!showMeatSelector}
                    product={selectedProduct}
                    selectedMeat={selectedMeat}
                    direction={direction}
                    shouldAnimate={!showSidebar && !showCart}
                  />
                </div>

              {/* Info Panel */}
              <div className="w-full lg:w-1/2 flex flex-col z-20 bg-[#0A0A0A]/40 lg:bg-transparent p-3 sm:p-4 lg:p-0 rounded-2xl lg:rounded-[2rem] backdrop-blur-md border border-white/5 lg:border-none shadow-2xl lg:shadow-none">
                <motion.div
                  key={selectedProduct.id + '-title'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-0 lg:mb-4 text-center lg:text-left"
                >
                  <h1 className="text-lg sm:text-xl lg:text-4xl xl:text-5xl font-bold mb-0 lg:mb-3 tracking-tight">{selectedProduct?.name}</h1>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-gray-400 text-[10px] lg:text-base">
                    <MapPin className="w-2.5 h-2.5 lg:w-4 lg:h-4" />
                    <span>Sucursal Principal</span>
                  </div>
                </motion.div>

                {selectedMeat ? (
                  <NutritionalInfo meat={{
                    id: selectedMeat.id,
                    name: selectedMeat?.name,
                    style: '',
                    price: selectedProduct.price + selectedMeat.price,
                    calories: (selectedProduct.calories || 0) + selectedMeat.calories,
                    protein: (selectedProduct.protein || 0) + selectedMeat.protein,
                    fat: (selectedProduct.fat || 0) + selectedMeat.fat,
                    carbs: (selectedProduct.carbs || 0) + selectedMeat.carbs,
                    shortName: selectedMeat?.name,
                  }} />
                ) : (
                  <div className="text-center text-gray-400 py-4">No hay información nutricional.</div>
                )}

                {/* Botón Seleccionar con estilo glass */}
                {!showMeatSelector && !meatSelected && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => {
                      setShowMeatSelector(true);
                    }}
                    className="w-full mt-1 lg:mt-6 px-6 py-2.5 lg:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all shadow-lg hover:shadow-xl text-sm lg:text-lg"
                  >
                    Seleccionar
                  </motion.button>
                )}
                


                <AnimatePresence>
                  {showMeatSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="mb-2 lg:mb-6"
                    >
                      <h3 className="text-xs font-semibold text-gray-400 mb-1 lg:mb-3 text-center lg:text-left">Selecciona tu Carne</h3>
                      <MeatSelector 
                        meats={meats}
                        selectedIndex={meatIndex}
                        onSelect={handleMeatChange}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {showMeatSelector && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    onClick={() => {
                      // Mostrar modal de opciones extra si existen y están habilitadas
                      const extraOptions = (selectedProduct.optionGroupIds?.filter(id => id !== linkedGroupId) || []).filter(id => {
                        const group = optionGroups.find(g => g.id === id);
                        return group && group.enabled;
                      });
                      if (extraOptions.length > 0) {
                        setShowMeatSelector(false);
                        setMeatSelected(true);
                        setShowBurgerOptions(true);
                      } else {
                        // Agregamos el producto al carrito de inmediato (el contador 🛒 subirá)
                        addItem(selectedProduct, meats[meatIndex], undefined, 1);
                        // Ocultamos el selector para que inicie la animación de colapso
                        setShowMeatSelector(false);
                        // NO reseteamos la carne ni el estado visual
                      }
                    }}
                    className="w-full text-white rounded-full py-2 sm:py-2.5 lg:py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-bold text-sm sm:text-base lg:text-xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                      boxShadow: `0 10px 25px rgba(${parseInt(siteConfig.primaryColor?.slice(1, 3) || 'FF', 16)}, ${parseInt(siteConfig.primaryColor?.slice(3, 5) || '9F', 16)}, ${parseInt(siteConfig.primaryColor?.slice(5, 7) || '0A', 16)}, 0.4)`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-[1.5s]" />
                    <span className="relative z-10">Elegir</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* ✨ NUEVO: Modal que se abrirá con las opciones extra de la hamburguesa */}
            {showBurgerOptions && (
              <ProductOptionsModal
                product={selectedProduct}
                isOpen={showBurgerOptions}
                onClose={() => setShowBurgerOptions(false)}
                excludedGroupIds={[linkedGroupId]} // Ocultamos la carne para que no la pida doble
                basePriceOverride={selectedProduct.price + selectedMeat.price} // Le pasamos el precio con la carne incluida
                onConfirm={(selectedOptions, notes) => {
                  // Agregar al carrito
                  addItem(selectedProduct, selectedMeat, selectedOptions, 1, notes);
                  // Cerrar modales (inicia la animación de colapso en el fondo)
                  setShowBurgerOptions(false);
                  // NO reseteamos la carne ni el estado visual
                }}
              />
            )}
            </div>
          ) : showInteractiveView && selectedProduct ? (
            /* Vista Interactiva para Productos con Opciones */
            <div className="z-20">
              {/* Product Selector si hay múltiples productos - Responsive */}
              {categoryProducts.length > 1 && (
                <>
                  {/* Desktop: Botones horizontales */}
                  <div className="hidden md:flex gap-2 lg:gap-3 pb-2 lg:pb-4 mb-4 lg:mb-6 justify-center flex-wrap">
                    {categoryProducts.map((prod, index) => (
                      <button
                        key={prod.id}
                        onClick={() => setSelectedProductIndex(index)}
                        className="flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all"
                        style={selectedProductIndex === index ? {
                          background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                          color: '#FFFFFF',
                          boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                        } : {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#D1D5DB'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedProductIndex !== index) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedProductIndex !== index) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }
                        }}
                      >
                        {prod?.name}
                      </button>
                    ))}
                  </div>

                  {/* Móvil: Carrusel con drag */}
                  <div className="md:hidden mb-4">
                    <div className="relative overflow-hidden">
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, { offset, velocity }) => {
                          const swipe = Math.abs(offset.x) * velocity.x;
                          if (swipe < -500 && selectedProductIndex < categoryProducts.length - 1) {
                            setSelectedProductIndex(selectedProductIndex + 1);
                          } else if (swipe > 500 && selectedProductIndex > 0) {
                            setSelectedProductIndex(selectedProductIndex - 1);
                          }
                        }}
                        className="cursor-grab active:cursor-grabbing"
                      >
                        <motion.div
                          key={selectedProductIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex justify-center px-4"
                        >
                          <div 
                            className="text-white px-6 py-3 rounded-xl text-center font-medium max-w-full"
                            style={{
                              background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                              boxShadow: `0 10px 15px -3px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                            }}
                          >
                            {categoryProducts[selectedProductIndex]?.name}
                          </div>
                        </motion.div>
                      </motion.div>
                    </div>
                    {/* Indicadores de carrusel */}
                    <div className="flex justify-center gap-1.5 mt-3">
                      {categoryProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedProductIndex(index)}
                          className="h-1.5 rounded-full transition-all"
                          style={selectedProductIndex === index ? {
                            width: '1.5rem',
                            backgroundColor: siteConfig.primaryColor || '#FF9F0A'
                          } : {
                            width: '0.375rem',
                            backgroundColor: '#4B5563'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedProductIndex !== index) {
                              e.currentTarget.style.backgroundColor = '#6B7280';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedProductIndex !== index) {
                              e.currentTarget.style.backgroundColor = '#4B5563';
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <InteractiveProductView
                product={selectedProduct}
                onAddToCart={(selectedOptions, notes) => {
                  addItem(selectedProduct, undefined, selectedOptions, 1, notes);
                  setShowCart(true);
                }}
              />
            </div>
          ) : (
            /* Vista de Otras Categorías (Grid de Productos) */
            <div className="z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 lg:mb-8"
              >
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{selectedCategory?.name}</h2>
                {selectedCategory?.description && (
                  <p className="text-sm sm:text-base text-gray-400">{selectedCategory.description}</p>
                )}
              </motion.div>

              {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                  {categoryProducts.map((product) => (
                    <ProductCard
                      {...{ key: product.id }}
                      product={product}
                      onOrder={() => {
                        addItem(product, undefined, undefined, 1);
                        setShowCart(true);
                      }}
                      onOrderWithOptions={(selectedOptions, notes) => {
                        addItem(product, undefined, selectedOptions, 1, notes);
                        setShowCart(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <p className="text-gray-400 text-base sm:text-lg">No hay productos disponibles en esta categoría</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
