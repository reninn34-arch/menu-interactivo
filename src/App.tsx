import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Menu, X, Clock, Loader2, AlertCircle, Instagram, Facebook, Music2 } from 'lucide-react';

const AdminPanel = lazy(() => import('./components/Admin').then(module => ({ default: module.AdminPanel })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(module => ({ default: module.AdminLogin })));

import { Cart } from './components/Cart';
import { CategorySelector } from './components/CategorySelector';
import { BurgerView } from './components/Views/BurgerView';
import { InteractiveView } from './components/Views/InteractiveView';
import { GridView } from './components/Views/GridView';
import { useMenu } from './contexts/MenuContext';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import { useSiteEffects } from './hooks/useSiteEffects';
import { useTouchNavigation } from './hooks/useTouchNavigation';
import { isRestaurantOpen, getScheduleDisplay } from './utils/openingHours';

export default function App() {
  // ALL HOOKS GO FIRST
  const { products, categories, optionGroups, siteConfig, isLoading, error } = useMenu();
  const { itemCount, addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [meatIndex, setMeatIndex] = useState(0);
  const [prevMeatIndex, setPrevMeatIndex] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // ✅ Issue 1 & 6: Centralized site side effects
  useSiteEffects({ siteConfig, onOpenAdmin: () => setShowAdmin(true) });

  // ✅ Issue 1: Touch navigation extracted to hook
  // NOTE: Must be called here (before early returns) to satisfy React's rules of hooks.
  // categoryProducts will be computed after the early returns for rendering, but
  // this hook receives live state values that update correctly.
  const categoryProductsForHook = products.filter(p => p.enabled && p.categoryId === selectedCategoryId);
  const { handleTouchStart, handleTouchEnd } = useTouchNavigation({
    itemCount: categoryProductsForHook.length,
    currentIndex: selectedProductIndex,
    onNavigate: setSelectedProductIndex,
  });

  // Force correct category selection on load
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.id === selectedCategoryId)) {
      const fallbackCat = categories.find(c => c.isMain) || categories[0];
      setSelectedCategoryId(fallbackCat ? fallbackCat.id : '');
      setSelectedProductIndex(0);
    }
  }, [categories, selectedCategoryId]);

  // Loading state
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
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Derived data
  const restaurantStatus = isRestaurantOpen(siteConfig);
  const categoryProducts = products.filter(p => p.enabled && p.categoryId === selectedCategoryId);
  const selectedProduct = categoryProducts[selectedProductIndex] || categoryProducts[0];
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

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

  const fallbackMeat = { id: 'none', name: 'Original', shortName: '', style: '', price: 0, calories: 0, protein: 0, fat: 0, carbs: 0 };
  const selectedMeat = meats[meatIndex] || meats[0] || fallbackMeat;

  const isBurgerCategory = selectedCategory?.isMain === true;
  const showInteractiveView = !isBurgerCategory;

  const handleMeatChange = (newIndex: number) => {
    setPrevMeatIndex(meatIndex);
    setMeatIndex(newIndex);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedProductIndex(0);
  };

  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>}>
        {/* Admin Login (unauthenticated) */}
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

        {/* Admin Panel (authenticated) */}
        {showAdmin && isAuthenticated && (
          <AdminPanel onClose={() => setShowAdmin(false)} />
        )}
      </Suspense>

      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />

      {/* Category Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
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
              {/* Social links – mobile sidebar only */}
              <div className="md:hidden p-6 mt-auto border-t border-white/10">
                <p className="text-xs text-gray-500 mb-4 text-center">Síguenos en redes sociales</p>
                <div className="flex justify-center gap-6">
                  {siteConfig.instagram && (
                    <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                      <Instagram className="w-5 h-5 text-gray-400 hover:text-white" />
                    </a>
                  )}
                  {siteConfig.facebook && (
                    <a href={siteConfig.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                      <Facebook className="w-5 h-5 text-gray-400 hover:text-white" />
                    </a>
                  )}
                  {siteConfig.tiktok && (
                    <a href={siteConfig.tiktok} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                      <Music2 className="w-5 h-5 text-gray-400 hover:text-white" />
                    </a>
                  )}
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
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 z-20 max-w-7xl mx-auto w-full relative">
          <button
            onClick={() => setShowSidebar(true)}
            aria-label="Abrir menú de navegación"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" aria-hidden="true" />
          </button>

          {/* Logo */}
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

          {/* Social + cart – desktop */}
          <div className="hidden md:flex items-center ml-auto gap-6">
            <div className="flex items-center gap-4">
              {siteConfig.instagram && (
                <a href={siteConfig.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <Instagram className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              )}
              {siteConfig.facebook && (
                <a href={siteConfig.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <Facebook className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              )}
              {siteConfig.tiktok && (
                <a href={siteConfig.tiktok} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                  <Music2 className="w-5 h-5 text-gray-400 hover:text-white" />
                </a>
              )}
            </div>
            <div className="h-6 w-px bg-white/30 mx-2" />
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
          </div>

          {/* Cart – mobile */}
          <div className="flex md:hidden items-center ml-auto">
            <button
              onClick={() => setShowCart(true)}
              aria-label={`Abrir carrito de compras, ${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`}
              className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors"
              style={{ marginRight: '0.5rem' }}
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
          </div>
        </header>

        {/* Closed restaurant banner */}
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
                  <p className="font-bold text-sm sm:text-base text-red-400">❌ Cerrado</p>
                  <p className="text-xs sm:text-sm text-white/80">{restaurantStatus.message}</p>
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowScheduleModal(false)}
                className="fixed inset-0 bg-black/60 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-gray-900 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Clock className="w-6 h-6" style={{ color: siteConfig.primaryColor || '#FF9F0A' }} />
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
                        <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <span className="text-white font-medium">{dayName}</span>
                          <span className="text-gray-400">{hours}</span>
                        </div>
                      );
                    })}
                  </div>

                  {siteConfig.allowOrdersOutsideHours && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-sm text-green-400 text-center">✅ Pedidos disponibles 24/7</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 pb-2 sm:pb-8 relative">
          {/* ✅ Issue 1: Views extracted to dedicated components */}
          {isBurgerCategory && selectedProduct ? (
            <BurgerView
              categoryProducts={categoryProducts}
              selectedProduct={selectedProduct}
              selectedProductIndex={selectedProductIndex}
              onSelectProductIndex={setSelectedProductIndex}
              meats={meats}
              meatIndex={meatIndex}
              prevMeatIndex={prevMeatIndex}
              onMeatChange={handleMeatChange}
              optionGroups={optionGroups}
              linkedGroupId={linkedGroupId}
              selectedMeat={selectedMeat}
              siteConfig={siteConfig}
              showSidebar={showSidebar}
              showCart={showCart}
              onAddItem={addItem}
            />
          ) : showInteractiveView && selectedProduct ? (
            <InteractiveView
              categoryProducts={categoryProducts}
              selectedProduct={selectedProduct}
              selectedProductIndex={selectedProductIndex}
              onSelectProductIndex={setSelectedProductIndex}
              siteConfig={siteConfig}
              onAddToCart={(selectedOptions, notes) => {
                addItem(selectedProduct, undefined, selectedOptions, 1, notes);
                setShowCart(true);
              }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
          ) : (
            <GridView
              categoryProducts={categoryProducts}
              selectedCategory={selectedCategory}
              onOrder={(product) => {
                addItem(product, undefined, undefined, 1);
                setShowCart(true);
              }}
              onOrderWithOptions={(product, selectedOptions, notes) => {
                addItem(product, undefined, selectedOptions, 1, notes);
                setShowCart(true);
              }}
            />
          )}
        </main>
      </div>
    </>
  );
}
