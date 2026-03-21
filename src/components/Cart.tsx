import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ShoppingBag, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useMenu } from '../contexts/MenuContext';
import { CheckoutForm, CheckoutData } from './CheckoutForm';
import { isRestaurantOpen } from '../utils/openingHours';
import { LayeredProductView } from './LayeredProductView';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart();
  const { siteConfig, optionGroups } = useMenu();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showClosedAlert, setShowClosedAlert] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    // Verificar si el restaurante está cerrado
    const restaurantStatus = isRestaurantOpen(siteConfig);
    if (!restaurantStatus.isOpen && !siteConfig.allowOrdersOutsideHours) {
      setShowClosedAlert(true);
      return;
    }
    
    setShowCheckoutForm(true);
  };

  const handleCheckoutSubmit = (customerData: CheckoutData) => {
    // Generar número de orden único
    const orderNumber = `ORD-${Date.now()}`;
    
    // Formatear mensaje de WhatsApp
    let message = `🍔 *NUEVO PEDIDO* 🍔\n\n`;
    message += `🧾 *Orden:* ${orderNumber}\n`;
    message += `🏬 *Sucursal:* ${siteConfig.branchName || siteConfig.siteName}\n\n`;
    
    // Datos del cliente
    message += `*DATOS DEL CLIENTE:*\n`;
    message += `👤 *Nombre:* ${customerData.customerName}\n`;
    message += `📞 *Teléfono:* ${customerData.customerPhone}\n`;
    message += `🚚 *Método:* ${customerData.deliveryMethod === 'delivery' ? '🚚 Delivery' : '🏬 Recoger en tienda'}\n`;
    
    if (customerData.deliveryMethod === 'delivery' && customerData.address) {
      message += `📍 *Dirección de entrega:*\n${customerData.address}\n`;
    }
    
    if (customerData.notes) {
      message += `📝 *Notas:* ${customerData.notes}\n`;
    }
    
    message += `\n`;
    
    // Agregar items del pedido
    message += `*PRODUCTOS:*\n`;
    message += `${'─'.repeat(30)}\n`;
    
    items.forEach((item, index) => {
      // Calcular precio del item
      const meatPrice = item.meat?.price || 0;
      const optionsPrice = Array.isArray(item.selectedOptions) 
        ? item.selectedOptions.reduce((sum, opt) => sum + opt.totalPrice, 0) 
        : 0;
      const itemBasePrice = item.product.price + meatPrice;
      const itemTotalPrice = itemBasePrice + optionsPrice;
      
      message += `\n${index + 1}. *${item.product.name}* (x${item.quantity})\n`;
      message += `   💲 ${siteConfig.currencySymbol}${itemBasePrice.toFixed(2)} c/u\n`;
      
      // Mostrar tipo de carne si aplica
      if (item.meat) {
        message += `   🥩 ${item.meat.name}\n`;
      }
      
      // Mostrar opciones seleccionadas
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        message += `   ⚙️ Opciones:\n`;
        item.selectedOptions.forEach(opt => {
          opt.valueNames.forEach((valueName, vIdx) => {
            // Buscar el precio individual de esta opción específica
            const valueId = opt.valueIds[vIdx];
            const groupDef = optionGroups.find(g => g.id === opt.groupId);
            const valueDef = groupDef?.values.find(v => v.id === valueId);
            const unitPrice = valueDef?.priceModifier || 0;
            
            const priceText = unitPrice > 0 ? ` (+${siteConfig.currencySymbol}${unitPrice.toFixed(2)})` : '';
            message += `      • ${valueName}${priceText}\n`;
          });
        });
      }
      
      message += `   Subtotal: ${siteConfig.currencySymbol}${(itemTotalPrice * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n${'─'.repeat(30)}\n`;
    message += `\n🧾 *Subtotal productos:* ${siteConfig.currencySymbol}${total.toFixed(2)}\n`;
    
    // Agregar costo de delivery si aplica
    const rawDeliveryCost = customerData.deliveryMethod === 'delivery' ? (siteConfig.deliveryCost || 0) : 0;
    const safeDeliveryCost = Number(rawDeliveryCost) || 0;
    if (safeDeliveryCost > 0) {
      message += `🚚 *Costo de delivery:* ${siteConfig.currencySymbol}${safeDeliveryCost.toFixed(2)}\n`;
    }
    
    const finalTotal = total + safeDeliveryCost;
    message += `\n💰 *TOTAL A PAGAR: ${siteConfig.currencySymbol}${finalTotal.toFixed(2)}*\n`;
    message += `🔢 *Cantidad de items:* ${itemCount}\n`;
    
    // Agregar dirección si está configurada
    if (siteConfig.restaurantAddress) {
      message += `\n📍 *Dirección:*\n${siteConfig.restaurantAddress}\n`;
    }
    
    message += `\n_Pedido generado desde ${siteConfig.siteName}_`;
    
    // Obtener número de WhatsApp según el método de entrega
    let whatsappNumber: string;
    if (customerData.deliveryMethod === 'delivery') {
      // Para delivery, usar whatsappNumberDelivery o fallback
      whatsappNumber = siteConfig.whatsappNumberDelivery || siteConfig.whatsappNumber || '1234567890';
    } else {
      // Para pickup, usar whatsappNumberPickup o fallback
      whatsappNumber = siteConfig.whatsappNumberPickup || siteConfig.whatsappNumber || '1234567890';
    }
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Abrir WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Cerrar formulario, limpiar carrito y cerrar drawer
    setShowCheckoutForm(false);
    clearCart();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment key="cart-drawer-content">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'tween',
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed right-0 top-0 h-full w-full sm:w-[450px] shadow-2xl z-50 flex flex-col"
            style={{ 
              willChange: 'transform',
              background: `linear-gradient(to bottom, ${siteConfig.backgroundColor || '#2D0D0A'}, ${siteConfig.backgroundColor ? `${siteConfig.backgroundColor}DD` : '#0A0604'})`
            }}
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <ShoppingBag 
                    className="w-6 h-6" 
                    style={{ color: siteConfig.primaryColor || '#FF9F0A' }}
                  />
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
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/20 flex-shrink-0 relative flex items-center justify-center">
                        {item.product.useLayeredView ? (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'scale(0.35)', transformOrigin: 'center' }}>
                            <LayeredProductView
                              product={item.product}
                              selectedOptions={item.selectedOptions?.reduce((acc, opt) => ({
                                ...acc,
                                [opt.groupId]: opt.valueIds[0] // Tomar el primer ID para la vista miniatura
                              }), {}) || (item.product.linkedOptionGroupId && item.meat ? { [item.product.linkedOptionGroupId]: item.meat.id } : {})}
                              isCollapsed={true}
                              shouldAnimate={false}
                              direction={1}
                            />
                          </div>
                        ) : item.product.image ? (
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
                          <p 
                            className="text-sm mb-1"
                            style={{ color: siteConfig.accentColor || '#FFB84D' }}
                          >
                            + {item.meat.name}
                          </p>
                        )}
                        {Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0 && (
                          <div className="space-y-1 mb-2">
                            {item.selectedOptions.map((option, optIndex) => (
                              <div key={`${item.id}-${option.groupId}-${optIndex}`} className="text-gray-400 text-xs flex flex-wrap gap-x-1">
                                <span className="font-medium text-gray-300">{option.groupName}:</span>
                                {option.valueNames.map((valueName, vIdx) => {
                                  const valueId = option.valueIds[vIdx];
                                  const groupDef = optionGroups.find(g => g.id === option.groupId);
                                  const valueDef = groupDef?.values.find(v => v.id === valueId);
                                  const unitPrice = valueDef?.priceModifier || 0;
                                  
                                  return (
                                    <span key={`${valueId}-${vIdx}`}>
                                      {valueName}
                                      {unitPrice > 0 && (
                                        <span 
                                          className="ml-0.5"
                                          style={{ color: siteConfig.accentColor || '#FFB84D' }}
                                        >
                                          (+${unitPrice.toFixed(2)})
                                        </span>
                                      )}
                                      {vIdx < option.valueNames.length - 1 ? ',' : ''}
                                    </span>
                                  );
                                })}
                              </div>
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
                        <p 
                          className="font-bold"
                          style={{ color: siteConfig.accentColor || '#FFB84D' }}
                        >
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
              <div 
                className="p-6 border-t border-white/10"
                style={{ backgroundColor: `${siteConfig.backgroundColor || '#000000'}33` }}
              >
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white text-xl font-bold">
                    <span>Total</span>
                    <span style={{ color: siteConfig.accentColor || '#FFB84D' }}>
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(to right, ${siteConfig.primaryColor || '#FF9F0A'}, ${siteConfig.secondaryColor || '#FF7A00'})`,
                    boxShadow: `0 10px 25px -5px ${siteConfig.primaryColor || '#FF9F0A'}4D`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 35px -5px ${siteConfig.primaryColor || '#FF9F0A'}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 10px 25px -5px ${siteConfig.primaryColor || '#FF9F0A'}4D`;
                  }}
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
        </React.Fragment>
      )}
      
      {/* Formulario de Checkout */}
      <CheckoutForm
        isOpen={showCheckoutForm}
        onClose={() => setShowCheckoutForm(false)}
        onSubmit={handleCheckoutSubmit}
        subtotal={total}
        deliveryCost={siteConfig.deliveryCost || 0}
        currencySymbol={siteConfig.currencySymbol}
        siteConfig={siteConfig}
      />

      {/* Modal de Restaurante Cerrado */}
      {showClosedAlert && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClosedAlert(false)}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-red-900/95 to-red-950/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  ❌ Estamos Cerrados
                </h3>
                <p className="text-red-200 mb-4">
                  {isRestaurantOpen(siteConfig).message}
                </p>
                {isRestaurantOpen(siteConfig).nextChange && (
                  <p className="text-white/80 text-sm mb-6">
                    Abriremos {isRestaurantOpen(siteConfig).nextChange!.day} a las {isRestaurantOpen(siteConfig).nextChange!.time}
                  </p>
                )}
                <p className="text-white/60 text-sm mb-6">
                  No podemos procesar pedidos fuera de nuestro horario de atención.
                </p>
                <button
                  onClick={() => setShowClosedAlert(false)}
                  className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
