import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    alert(`Total a pagar: $${total.toFixed(2)}\n\nPedido confirmado!\n${itemCount} items en tu orden.`);
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-gradient-to-b from-[#2D0D0A] to-[#0A0604] shadow-2xl z-50 flex flex-col"
            style={{ willChange: 'transform' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold text-white">Tu Pedido</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Tu carrito está vacío</p>
                  <p className="text-gray-500 text-sm mt-2">Agrega productos para comenzar</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            {item.product.categoryId === 'burgers' && '🍔'}
                            {item.product.categoryId === 'drinks' && '🥤'}
                            {item.product.categoryId === 'sides' && '🍟'}
                            {item.product.categoryId === 'desserts' && '🍰'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-1">{item.product.name}</h3>
                        {item.meat && (
                          <p className="text-orange-400 text-sm mb-1">+ {item.meat.name}</p>
                        )}
                        {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {item.selectedOptions.map((option) => (
                              <p key={option.groupId} className="text-gray-400 text-xs">
                                {option.groupName}: {option.valueNames.join(', ')}
                                {option.totalPrice > 0 && (
                                  <span className="text-orange-400 ml-1">+${option.totalPrice.toFixed(2)}</span>
                                )}
                              </p>
                            ))}
                          </div>
                        )}
                        {item.notes && (
                          <p className="text-gray-500 text-xs italic mb-2">"{item.notes}"</p>
                        )}
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="w-8 h-8 rounded-md bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors ml-auto"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-orange-400 font-bold">
                          ${(
                            (item.product.price + 
                            (item.meat?.price || 0) + 
                            (Array.isArray(item.selectedOptions) ? item.selectedOptions.reduce((sum, opt) => sum + opt.totalPrice, 0) : 0)) 
                            * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span className="text-orange-400">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all hover:scale-105"
                >
                  Confirmar Pedido
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-2 mt-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
