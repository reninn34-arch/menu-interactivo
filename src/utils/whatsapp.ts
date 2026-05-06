import { CartItem, SiteConfig } from '../types';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

export const formatWhatsAppMessage = (
  cartItems: CartItem[],
  config: SiteConfig,
  customerData: {
    name: string;
    phone: string;
    deliveryMethod: 'delivery' | 'pickup';
    address?: string;
    notes?: string;
  }
): WhatsAppMessage => {
  const { currencySymbol, deliveryCost, restaurantAddress, siteName } = config;
  
  const phone = customerData.deliveryMethod === 'pickup' 
    ? config.whatsappNumberPickup || config.whatsappNumber || ''
    : config.whatsappNumberDelivery || config.whatsappNumber || '';

  const lines: string[] = [
    `🍔 *${siteName || 'Pedido'}*`,
    '',
    `👤 *Cliente:* ${customerData.name}`,
    `📞 *Teléfono:* ${customerData.phone}`,
    '',
    customerData.deliveryMethod === 'delivery'
      ? `🏠 *Entrega a domicilio*`
      : `🏪 *Recoger en tienda*`,
  ];

  if (customerData.deliveryMethod === 'delivery' && customerData.address) {
    lines.push(`📍 *Dirección:* ${customerData.address}`);
  } else if (restaurantAddress) {
    lines.push(`📍 *Dirección:* ${restaurantAddress}`);
  }

  lines.push('');
  lines.push('📋 _Detalle del pedido:_');

  cartItems.forEach((item, index) => {
    const { product, meat, selectedOptions, quantity, notes } = item;
    const itemPrice = calculateItemPrice(item);
    
    lines.push(`${index + 1}. ${quantity}x ${product.name}`);
    
    if (meat) {
      lines.push(`   🥩 ${meat.name}`);
    }
    
    if (selectedOptions && selectedOptions.length > 0) {
      selectedOptions.forEach(opt => {
        lines.push(`   ${opt.valueNames.join(', ')}`);
      });
    }
    
    if (notes) {
      lines.push(`   📝 Nota: ${notes}`);
    }
    
    lines.push(`   💰 ${currencySymbol}${itemPrice.toFixed(2)}`);
    lines.push('');
  });

  const subtotal = cartItems.reduce((sum, item) => sum + calculateItemPrice(item), 0);
  const deliveryFee = customerData.deliveryMethod === 'delivery' ? (deliveryCost || 0) : 0;
  const total = subtotal + deliveryFee;

  lines.push('------------------------');
  lines.push(`💵 *Subtotal:* ${currencySymbol}${subtotal.toFixed(2)}`);
  
  if (deliveryFee > 0) {
    lines.push(`🚚 *Costo de envío:* ${currencySymbol}${deliveryFee.toFixed(2)}`);
  }
  
  lines.push(`💰 *TOTAL:* ${currencySymbol}${total.toFixed(2)}`);
  lines.push('');

  if (customerData.notes) {
    lines.push(`📝 *Notas adicionales:* ${customerData.notes}`);
    lines.push('');
  }

  lines.push('_Enviado desde el menú digital_');

  return {
    phone: phone.replace(/\D/g, ''),
    message: lines.join('\n'),
  };
};

const calculateItemPrice = (item: CartItem): number => {
  const basePrice = Number(item.product?.price) || 0;
  const meatPrice = Number(item.meat?.price) || 0;
  const optionsPrice = Array.isArray(item.selectedOptions)
    ? item.selectedOptions.reduce((sum, opt) => sum + (Number(opt.totalPrice) || 0), 0)
    : 0;
  return (basePrice + meatPrice + optionsPrice) * item.quantity;
};

export const generateWhatsAppUrl = (
  items: CartItem[],
  config: SiteConfig,
  customerData: {
    name: string;
    phone: string;
    deliveryMethod: 'delivery' | 'pickup';
    address?: string;
    notes?: string;
  }
): string => {
  const { phone, message } = formatWhatsAppMessage(items, config, customerData);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};