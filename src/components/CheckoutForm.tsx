import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, User, Phone, MapPin, Home, Store, ShoppingCart } from 'lucide-react';

interface CheckoutFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CheckoutData) => void;
  subtotal: number;
  deliveryCost: number;
  currencySymbol: string;
}

export interface CheckoutData {
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'delivery' | 'pickup';
  address?: string;
  notes?: string;
}

export const CheckoutForm = ({ isOpen, onClose, onSubmit, subtotal, deliveryCost, currencySymbol }: CheckoutFormProps) => {
  const [formData, setFormData] = useState<CheckoutData>({
    customerName: '',
    customerPhone: '',
    deliveryMethod: 'pickup',
    address: '',
    notes: ''
  });

  // Reset form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerName: '',
        customerPhone: '',
        deliveryMethod: 'pickup',
        address: '',
        notes: ''
      });
    }
  }, [isOpen]);

  // Calcular total dinámicamente y de forma segura
  const safeSubtotal = Number(subtotal) || 0;
  const safeDelivery = Number(deliveryCost) || 0;
  const currentDeliveryCost = formData.deliveryMethod === 'delivery' ? safeDelivery : 0;
  const total = safeSubtotal + currentDeliveryCost;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.customerName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }
    
    if (!formData.customerPhone.trim()) {
      alert('Por favor ingresa tu teléfono');
      return;
    }
    
    if (formData.deliveryMethod === 'delivery' && !formData.address?.trim()) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg max-h-[90vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Confirmar Pedido</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <p className="text-orange-100 text-sm mt-2">
            Completa los datos para procesar tu orden
          </p>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre Completo *
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Teléfono de Contacto *
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Ej: 555-1234567"
              required
            />
          </div>

          {/* Método de Entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Método de Entrega *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryMethod: 'pickup' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.deliveryMethod === 'pickup'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <Store className={`w-8 h-8 mx-auto mb-2 ${
                  formData.deliveryMethod === 'pickup' ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className={`font-semibold ${
                  formData.deliveryMethod === 'pickup' ? 'text-orange-500' : 'text-gray-300'
                }`}>
                  Recoger
                </div>
                <div className="text-xs text-gray-500 mt-1">En tienda</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryMethod: 'delivery' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.deliveryMethod === 'delivery'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <Home className={`w-8 h-8 mx-auto mb-2 ${
                  formData.deliveryMethod === 'delivery' ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className={`font-semibold ${
                  formData.deliveryMethod === 'delivery' ? 'text-orange-500' : 'text-gray-300'
                }`}>
                  Delivery
                </div>
                <div className="text-xs text-gray-500 mt-1">A domicilio</div>
              </button>
            </div>
          </div>

          {/* Dirección (solo si es delivery) */}
          {formData.deliveryMethod === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Dirección de Entrega *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                placeholder="Calle, número, colonia, referencias..."
                rows={3}
                required
              />
            </motion.div>
          )}

          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              placeholder="Alguna indicación especial para tu pedido..."
              rows={2}
            />
          </div>

          {/* Resumen del Pedido */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <h3 className="text-white font-semibold">Resumen del Pedido</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span className="font-medium">{currencySymbol}{safeSubtotal.toFixed(2)}</span>
              </div>
              
              {formData.deliveryMethod === 'delivery' && safeDelivery > 0 && (
                <div className="flex justify-between text-orange-400">
                  <span>🚚 Delivery:</span>
                  <span className="font-medium">{currencySymbol}{safeDelivery.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between text-white text-lg font-bold">
                  <span>Total:</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all"
            >
              Enviar Pedido
            </button>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
  );
};
