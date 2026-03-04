import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ShoppingCart, Menu, X } from 'lucide-react';
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

export default function App() {
  const { products, categories, optionGroups } = useMenu();
  const { itemCount, addItem } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [selectedCategoryId, setSelectedCategoryId] = useState('burgers');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [meatIndex, setMeatIndex] = useState(0);
  const [prevMeatIndex, setPrevMeatIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMeatSelector, setShowMeatSelector] = useState(false);
  const [meatSelected, setMeatSelected] = useState(false);
  const [showBurgerOptions, setShowBurgerOptions] = useState(false);

  // Solo permitir acceso al admin si está autenticado
  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setShowAdmin(true);
    }
  };

  // Detectar combinación de teclas Ctrl+Shift+A para acceder al admin
  useState(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  });
  
  // Obtener carnes desde el grupo de opciones "meat-type"
  const meatOptionGroup = optionGroups.find(g => g.id === 'meat-type');
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
  
  // Filtrar productos por categoría seleccionada
  const categoryProducts = products.filter(p => p.enabled && p.categoryId === selectedCategoryId);
  const selectedProduct = categoryProducts[selectedProductIndex] || categoryProducts[0];
  const selectedMeat = meats[meatIndex] || meats[0];
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  // Determinar si mostrar vista interactiva
  const hasInteractiveProducts = categoryProducts.some(p => p.optionGroupIds && p.optionGroupIds.length > 0);
  const showInteractiveView = selectedCategoryId !== 'burgers' && hasInteractiveProducts;

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
              className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-white/10 z-50 overflow-y-auto"
              style={{ willChange: 'transform' }}
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        selectedCategoryId === category.id
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{category.name}</div>
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

      <div className="min-h-screen bg-gradient-to-br from-[#4A1410] via-[#2D0D0A] to-[#0A0604] text-white font-sans flex flex-col selection:bg-orange-500/30 overflow-hidden">
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#6B1F1A]/20 via-transparent to-black/40 pointer-events-none" />
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 z-20 max-w-7xl mx-auto w-full relative">
          {/* Botón de menú hamburguesa */}
          <button
            onClick={() => setShowSidebar(true)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          {/* Carrito */}
          <button
            onClick={() => setShowCart(true)}
            className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors"
            title="Carrito de Compras"
          >
            <ShoppingCart className="w-5 h-5 text-white" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 pb-2 sm:pb-8 relative">
          {/* Vista de Hamburguesas */}
          {selectedCategoryId === 'burgers' && selectedProduct ? (
            <div className="z-20 w-full">
              
              {/* ✨ NUEVO: Selector horizontal para cambiar de hamburguesa ✨ */}
              {categoryProducts.length > 1 && (
                <div className="mb-4 lg:mb-6 flex gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-4 scrollbar-hide justify-center">
                  {categoryProducts.map((prod, index) => (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProductIndex(index)}
                      className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all ${
                        selectedProductIndex === index
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>
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
                  key={selectedMeat.id + '-title'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-0 lg:mb-4 text-center lg:text-left"
                >
                  <h1 className="text-lg sm:text-xl lg:text-4xl xl:text-5xl font-bold mb-0 lg:mb-3 tracking-tight">{selectedMeat.name}</h1>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-gray-400 text-[10px] lg:text-base">
                    <MapPin className="w-2.5 h-2.5 lg:w-4 lg:h-4" />
                    <span>Sucursal Principal</span>
                  </div>
                </motion.div>

                <NutritionalInfo meat={{
                  id: selectedMeat.id,
                  name: selectedMeat.name,
                  style: '',
                  price: selectedProduct.price + selectedMeat.price,
                  calories: (selectedProduct.calories || 0) + selectedMeat.calories,
                  protein: (selectedProduct.protein || 0) + selectedMeat.protein,
                  fat: (selectedProduct.fat || 0) + selectedMeat.fat,
                  carbs: (selectedProduct.carbs || 0) + selectedMeat.carbs,
                  shortName: selectedMeat.name,
                }} />

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
                
                {/* Botón Agregar (después de elegir) */}
                {!showMeatSelector && meatSelected && (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Verificamos si la hamburguesa tiene otros grupos de opciones asignados aparte de la carne
                      const extraOptions = selectedProduct.optionGroupIds?.filter(id => id !== 'meat-type') || [];
                      
                      if (extraOptions.length > 0) {
                        // Si tiene extras (ej: Tamaño de Combo, Sin Cebolla), mostramos el modal
                        setShowBurgerOptions(true);
                      } else {
                        // Si no tiene más opciones, va directo al carrito
                        addItem(selectedProduct, selectedMeat, undefined, 1);
                        setShowCart(true);
                        setMeatSelected(false);
                      }
                    }}
                    className="w-full mt-1 lg:mt-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full py-2.5 lg:py-4 px-6 text-white font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm lg:text-lg"
                  >
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
                    Agregar al Carrito
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
                      setShowMeatSelector(false);
                      setMeatSelected(true);
                    }}
                    className="w-full bg-gradient-to-r from-[#FF9F0A] to-[#FF7A00] text-white rounded-full py-2 sm:py-2.5 lg:py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-bold text-sm sm:text-base lg:text-xl shadow-[0_10px_25px_rgba(255,159,10,0.4)] relative overflow-hidden"
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
                excludedGroupIds={['meat-type']} // Ocultamos la carne para que no la pida doble
                basePriceOverride={selectedProduct.price + selectedMeat.price} // Le pasamos el precio con la carne incluida
                onConfirm={(selectedOptions) => {
                  addItem(selectedProduct, selectedMeat, selectedOptions, 1);
                  setShowCart(true);
                  setShowBurgerOptions(false);
                  setMeatSelected(false);
                }}
              />
            )}
            </div>
          ) : showInteractiveView && selectedProduct ? (
            /* Vista Interactiva para Productos con Opciones */
            <div className="z-20">
              {/* Product Selector si hay múltiples productos */}
              {categoryProducts.length > 1 && (
                <div className="mb-4 lg:mb-6 flex gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-4 scrollbar-hide">
                  {categoryProducts.map((prod, index) => (
                    <button
                      key={prod.id}
                      onClick={() => setSelectedProductIndex(index)}
                      className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all ${
                        selectedProductIndex === index
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>
              )}

              <InteractiveProductView
                product={selectedProduct}
                onAddToCart={(selectedOptions) => {
                  addItem(selectedProduct, undefined, selectedOptions, 1);
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
                      onOrderWithOptions={(selectedOptions) => {
                        addItem(product, undefined, selectedOptions, 1);
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
