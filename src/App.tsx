import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ArrowLeft, ShoppingCart } from 'lucide-react';
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

      {showCart && <Cart onClose={() => setShowCart(false)} />}

      <div className="min-h-screen bg-gradient-to-br from-[#4A1410] via-[#2D0D0A] to-[#0A0604] text-white font-sans flex flex-col selection:bg-orange-500/30 overflow-hidden">
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#6B1F1A]/20 via-transparent to-black/40 pointer-events-none" />
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-6 z-20 max-w-7xl mx-auto w-full relative">
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
          </div>
        </header>

        {/* Category Selector */}
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 z-20 relative">
          <CategorySelector
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={handleCategoryChange}
          />
        </div>

        <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 pb-8 sm:pb-12 relative">
          {/* Vista de Hamburguesas */}
          {selectedCategoryId === 'burgers' && selectedProduct ? (
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8 xl:gap-16">
              {/* Burger Visualization */}
              <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center py-6 lg:py-8 z-10 min-h-[350px] lg:min-h-[400px]">
                <Burger 
                  isCollapsed={isCollapsed}
                  product={selectedProduct}
                  selectedMeat={selectedMeat}
                  direction={direction}
                />
              </div>

              {/* Info Panel */}
              <div className="w-full lg:w-1/2 flex flex-col z-20 bg-[#0A0A0A]/40 lg:bg-transparent p-5 sm:p-6 lg:p-0 rounded-2xl lg:rounded-[2rem] backdrop-blur-md border border-white/5 lg:border-none shadow-2xl lg:shadow-none">
                <motion.div
                  key={selectedMeat.id + '-title'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mb-5 lg:mb-6 xl:mb-8 text-center lg:text-left"
                >
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 lg:mb-3 tracking-tight">{selectedMeat.name}</h1>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-400 text-sm lg:text-base">
                    <MapPin className="w-4 h-4" />
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

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 text-center lg:text-left">Selecciona tu Carne</h3>
                  <MeatSelector 
                    meats={meats}
                    selectedIndex={meatIndex}
                    onSelect={handleMeatChange}
                  />
                </div>

                <OrderButton 
                  price={selectedProduct.price + selectedMeat.price}
                  onOrder={() => {
                    addItem(selectedProduct, selectedMeat, undefined, 1);
                    setShowCart(true);
                  }}
                />
              </div>
            </div>
          ) : showInteractiveView && selectedProduct ? (
            /* Vista Interactiva para Productos con Opciones */
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

              {/* Product Selector si hay múltiples productos */}
              {categoryProducts.length > 1 && (
                <div className="mb-6 lg:mb-8 flex gap-2 lg:gap-3 overflow-x-auto pb-3 lg:pb-4 scrollbar-hide">
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
                key={selectedProduct.id}
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
                      key={product.id}
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
