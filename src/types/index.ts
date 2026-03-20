export interface MeatOption {
  id: string;
  name: string;
  style: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  shortName: string;
  image?: string; // URL o base64 de la imagen
}

export interface Ingredient {
  id: string;
  name: string;
  type: 'bun-top' | 'cheese' | 'meat' | 'tomato' | 'lettuce' | 'bun-bottom' | 'custom';
  image?: string;
  enabled: boolean;
  order: number;
  isVariable?: boolean; // Si esta capa cambia según opciones del cliente
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  enabled: boolean;
  order: number;
  isMain?: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  enabled: boolean;
  featured?: boolean;
  order: number;
  ingredientIds?: string[];
  optionGroupIds?: string[]; // IDs de grupos de opciones asociados
  // Campos para visualización con capas animadas
  useLayeredView?: boolean; // Activa la visualización con capas tipo burger
  // @deprecated - Usar el sistema is3DLayer en ProductOptionGroup en su lugar
  variableIngredientId?: string; // ID del ingrediente que cambia con opciones
  // @deprecated - Usar el sistema is3DLayer en ProductOptionGroup en su lugar  
  linkedOptionGroupId?: string; // ID del grupo de opciones vinculado a la capa variable
  // Disponibilidad y tiempo de preparación
  inStock?: boolean; // Si hay inventario disponible (default: true)
  estimatedTime?: number; // Tiempo de preparación en minutos
}

export interface ProductOptionValue {
  id: string;
  name: string;
  priceModifier: number; // Cuánto suma o resta al precio base (+2.00, -1.00, etc)
  enabled: boolean;
  order: number;
  // Campos para visualización en capas
  image?: string; // URL o base64 de la imagen de la capa
  style?: string; // Estilos CSS (gradientes) para capas sin imagen
  // Información nutricional opcional
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string; // Ej: "Tamaño", "Tipo de Leche", "Extra Ingredientes"
  description?: string;
  required: boolean; // Si es obligatorio seleccionar una opción
  multiSelect: boolean; // Si permite seleccionar múltiples opciones
  minSelections?: number;
  maxSelections?: number;
  values: ProductOptionValue[];
  enabled: boolean;
  order: number;
  // ✨ NUEVO: Propiedades para el sistema de capas 3D nativo
  is3DLayer?: boolean;  // ¿Este grupo se renderiza como capa 3D?
  layerOrder?: number;  // Posición en la pila de capas (eg: 3 = entre queso y pan)
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  logo?: string;
  logoWidth?: number;  // Ancho del logo en pixeles (default: 120)
  logoHeight?: number; // Alto del logo en pixeles (default: 40)
  faviconUrl?: string; // URL del favicon personalizado
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  branchName: string;
  currency: string;
  currencySymbol: string;
  whatsappNumber?: string; // Deprecated - mantener por compatibilidad
  whatsappNumberPickup?: string;
  whatsappNumberDelivery?: string;
  restaurantAddress?: string;
  deliveryCost?: number;
  // Horarios de operación del restaurante
  openingHours?: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  allowOrdersOutsideHours?: boolean; // Permitir pedidos fuera de horario
}

export interface BurgerComponentProps {
  isCollapsed: boolean;
  imageUrl?: string;
}

export interface MeatProps extends BurgerComponentProps {
  style: string;
  id: string;
  direction: number;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  valueIds: string[]; // IDs de las opciones seleccionadas
  valueNames: string[]; // Nombres para mostrar
  totalPrice: number; // Suma de priceModifiers de las opciones seleccionadas
}

export interface CartItem {
  id: string; // ID único del item en el carrito
  product: Product;
  meat?: MeatOption; // Solo para hamburguesas
  selectedOptions?: SelectedOption[]; // Opciones seleccionadas del producto
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
