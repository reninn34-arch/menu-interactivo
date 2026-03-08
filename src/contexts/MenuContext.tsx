import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { MeatOption, Ingredient, Category, Product, SiteConfig, ProductOptionGroup } from '../types';
import { MEATS } from '../constants/meats';

interface MenuContextType {
  meats: MeatOption[];
  ingredients: Ingredient[];
  categories: Category[];
  products: Product[];
  optionGroups: ProductOptionGroup[];
  siteConfig: SiteConfig;
  updateMeat: (id: string, updates: Partial<MeatOption>) => void;
  addMeat: (meat: MeatOption) => void;
  deleteMeat: (id: string) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  addIngredient: (ingredient: Ingredient) => void;
  deleteIngredient: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  addCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateOptionGroup: (id: string, updates: Partial<ProductOptionGroup>) => void;
  addOptionGroup: (group: ProductOptionGroup) => void;
  deleteOptionGroup: (id: string) => void;
  updateSiteConfig: (updates: Partial<SiteConfig>) => void;
  resetToDefaults: () => void;
  invalidateCache: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const DEFAULT_INGREDIENTS: Ingredient[] = [
  { id: 'top-bun', name: 'Pan Superior', type: 'bun-top', enabled: true, order: 1, isVariable: false },
  { id: 'cheese', name: 'Queso', type: 'cheese', enabled: true, order: 2, isVariable: false },
  { id: 'meat-default', name: 'Carne', type: 'meat', enabled: true, order: 3, isVariable: true },
  { id: 'tomato', name: 'Tomate', type: 'tomato', enabled: true, order: 4, isVariable: false },
  { id: 'lettuce', name: 'Lechuga', type: 'lettuce', enabled: true, order: 5, isVariable: false },
  { id: 'bottom-bun', name: 'Pan Inferior', type: 'bun-bottom', enabled: true, order: 6, isVariable: false },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Hamburguesas', description: 'Deliciosas hamburguesas gourmet', icon: '🍔', enabled: true, order: 1 },
  { id: 'drinks', name: 'Bebidas', description: 'Bebidas refrescantes', icon: '🥤', enabled: true, order: 2 },
  { id: 'sides', name: 'Acompañamientos', description: 'Papas, aros y más', icon: '🍟', enabled: true, order: 3 },
  { id: 'desserts', name: 'Postres', description: 'Dulces tentaciones', icon: '🍰', enabled: true, order: 4 },
];

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'Burger House',
  tagline: 'Las mejores hamburguesas de la ciudad',
  logoWidth: 120,
  logoHeight: 40,
  primaryColor: '#FF9F0A',
  secondaryColor: '#FF7A00',
  backgroundColor: '#1A110C',
  textColor: '#FFFFFF',
  accentColor: '#FFD700',
  branchName: 'Sucursal Principal',
  currency: 'USD',
  currencySymbol: '$',
  whatsappNumber: '1234567890',
  whatsappNumberPickup: '1234567890',
  whatsappNumberDelivery: '1234567890',
  restaurantAddress: 'Calle Principal #123, Ciudad',
  deliveryCost: 2.50,
};

const DEFAULT_OPTION_GROUPS: ProductOptionGroup[] = [
  {
    id: 'meat-type',
    name: 'Tipo de Carne',
    description: 'Elige el tipo de proteína para tu producto',
    required: true,
    multiSelect: false,
    minSelections: 1,
    maxSelections: 1,
    enabled: true,
    order: 1,
    values: MEATS.map((meat, index) => ({
      id: meat.id,
      name: meat.name,
      priceModifier: meat.price,
      enabled: true,
      order: index + 1,
      image: meat.image,
      style: meat.style,
      calories: meat.calories,
      protein: meat.protein,
      fat: meat.fat,
      carbs: meat.carbs,
    }))
  },
  {
    id: 'drink-size',
    name: 'Tamaño de Bebida',
    description: 'Elige el tamaño de tu bebida',
    required: true,
    multiSelect: false,
    minSelections: 1,
    maxSelections: 1,
    enabled: true,
    order: 2,
    values: [
      { id: 'size-small', name: 'Pequeño', priceModifier: 0, enabled: true, order: 1 },
      { id: 'size-medium', name: 'Mediano', priceModifier: 0.50, enabled: true, order: 2 },
      { id: 'size-large', name: 'Grande', priceModifier: 1.00, enabled: true, order: 3 },
    ]
  },
  {
    id: 'side-size',
    name: 'Porción',
    description: 'Elige el tamaño de la porción',
    required: true,
    multiSelect: false,
    minSelections: 1,
    maxSelections: 1,
    enabled: true,
    order: 3,
    values: [
      { id: 'portion-regular', name: 'Regular', priceModifier: 0, enabled: true, order: 1 },
      { id: 'portion-large', name: 'Grande', priceModifier: 1.50, enabled: true, order: 2 },
      { id: 'portion-xl', name: 'Extra Grande', priceModifier: 3.00, enabled: true, order: 3 },
    ]
  },
  {
    id: 'dessert-extras',
    name: 'Extras',
    description: 'Personaliza tu postre',
    required: false,
    multiSelect: true,
    minSelections: 0,
    maxSelections: 3,
    enabled: true,
    order: 4,
    values: [
      { id: 'extra-icecream', name: 'Helado', priceModifier: 1.50, enabled: true, order: 1 },
      { id: 'extra-cream', name: 'Crema Batida', priceModifier: 0.75, enabled: true, order: 2 },
      { id: 'extra-caramel', name: 'Caramelo', priceModifier: 0.50, enabled: true, order: 3 },
      { id: 'extra-chocolate', name: 'Chocolate', priceModifier: 0.50, enabled: true, order: 4 },
    ]
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'burger-parrilla',
    categoryId: 'burgers',
    name: 'Pollo Parrilla',
    description: 'Jugoso pollo a la parrilla con vegetales frescos',
    price: 5.00,
    calories: 250,
    protein: 8,
    fat: 10,
    carbs: 35,
    enabled: true,
    featured: true,
    order: 1,
    ingredientIds: ['top-bun', 'cheese', 'meat-default', 'tomato', 'lettuce', 'bottom-bun'],
    optionGroupIds: ['meat-type'],
    useLayeredView: true,
    variableIngredientId: 'meat-default',
    linkedOptionGroupId: 'meat-type'
  },
  {
    id: 'burger-premium',
    categoryId: 'burgers',
    name: 'Carne de Res Premium',
    description: 'Carne premium 100% res con queso y vegetales',
    price: 6.00,
    calories: 280,
    protein: 10,
    fat: 12,
    carbs: 38,
    enabled: true,
    featured: true,
    order: 2,
    ingredientIds: ['top-bun', 'cheese', 'meat-default', 'tomato', 'lettuce', 'bottom-bun'],
    optionGroupIds: ['meat-type'],
    useLayeredView: true,
    variableIngredientId: 'meat-default',
    linkedOptionGroupId: 'meat-type'
  },
  {
    id: 'burger-pescado',
    categoryId: 'burgers',
    name: 'Pescado',
    description: 'Delicioso filete de pescado empanizado',
    price: 4.50,
    calories: 230,
    protein: 7,
    fat: 8,
    carbs: 40,
    enabled: true,
    featured: false,
    order: 3,
    ingredientIds: ['top-bun', 'cheese', 'meat-default', 'tomato', 'lettuce', 'bottom-bun'],
    optionGroupIds: ['meat-type'],
    useLayeredView: true,
    variableIngredientId: 'meat-default',
    linkedOptionGroupId: 'meat-type'
  },
  {
    id: 'burger-crujiente',
    categoryId: 'burgers',
    name: 'Pollo Crujiente',
    description: 'Pollo crujiente con salsa especial',
    price: 5.50,
    calories: 260,
    protein: 9,
    fat: 11,
    carbs: 42,
    enabled: true,
    featured: false,
    order: 4,
    ingredientIds: ['top-bun', 'cheese', 'meat-default', 'tomato', 'lettuce', 'bottom-bun'],
    optionGroupIds: ['meat-type'],
    useLayeredView: true,
    variableIngredientId: 'meat-default',
    linkedOptionGroupId: 'meat-type'
  },
  // Bebidas
  {
    id: 'drink-cola',
    categoryId: 'drinks',
    name: 'Coca-Cola',
    description: 'Refresco clásico 500ml',
    price: 2.50,
    calories: 210,
    carbs: 54,
    enabled: true,
    featured: true,
    order: 1,
    optionGroupIds: ['drink-size']
  },
  {
    id: 'drink-sprite',
    categoryId: 'drinks',
    name: 'Sprite',
    description: 'Refresco de lima-limón 500ml',
    price: 2.50,
    calories: 190,
    carbs: 48,
    enabled: true,
    featured: false,
    order: 2,
    optionGroupIds: ['drink-size']
  },
  {
    id: 'drink-fanta',
    categoryId: 'drinks',
    name: 'Fanta Naranja',
    description: 'Refresco de naranja 500ml',
    price: 2.50,
    calories: 200,
    carbs: 52,
    enabled: true,
    featured: false,
    order: 3,
    optionGroupIds: ['drink-size']
  },
  {
    id: 'drink-water',
    categoryId: 'drinks',
    name: 'Agua Mineral',
    description: 'Agua purificada 500ml',
    price: 1.50,
    calories: 0,
    carbs: 0,
    enabled: true,
    featured: false,
    order: 4,
    optionGroupIds: ['drink-size']
  },
  {
    id: 'drink-juice',
    categoryId: 'drinks',
    name: 'Jugo Natural',
    description: 'Jugo de naranja recién exprimido',
    price: 3.50,
    calories: 110,
    carbs: 26,
    enabled: true,
    featured: true,
    order: 5,
    optionGroupIds: ['drink-size']
  },
  {
    id: 'drink-milkshake',
    categoryId: 'drinks',
    name: 'Malteada',
    description: 'Malteada de vainilla cremosa',
    price: 4.50,
    calories: 420,
    protein: 12,
    fat: 15,
    carbs: 65,
    enabled: true,
    featured: true,
    order: 6,
    optionGroupIds: ['drink-size']
  },
  // Acompañamientos
  {
    id: 'side-fries',
    categoryId: 'sides',
    name: 'Papas Fritas',
    description: 'Papas crujientes doradas',
    price: 3.00,
    calories: 320,
    protein: 4,
    fat: 15,
    carbs: 44,
    enabled: true,
    featured: true,
    order: 1,
    optionGroupIds: ['side-size']
  },
  {
    id: 'side-onion-rings',
    categoryId: 'sides',
    name: 'Aros de Cebolla',
    description: 'Aros de cebolla empanizados y fritos',
    price: 3.50,
    calories: 280,
    protein: 4,
    fat: 14,
    carbs: 35,
    enabled: true,
    featured: true,
    order: 2,
    optionGroupIds: ['side-size']
  },
  {
    id: 'side-nuggets',
    categoryId: 'sides',
    name: 'Nuggets de Pollo',
    description: '6 piezas de nuggets crujientes',
    price: 4.00,
    calories: 270,
    protein: 15,
    fat: 16,
    carbs: 18,
    enabled: true,
    featured: true,
    order: 3,
    optionGroupIds: ['side-size']
  },
  {
    id: 'side-salad',
    categoryId: 'sides',
    name: 'Ensalada Fresca',
    description: 'Ensalada verde con aderezo',
    price: 3.50,
    calories: 120,
    protein: 3,
    fat: 6,
    carbs: 15,
    enabled: true,
    featured: false,
    order: 4,
    optionGroupIds: ['side-size']
  },
  // Postres
  {
    id: 'dessert-sundae',
    categoryId: 'desserts',
    name: 'Sundae de Chocolate',
    description: 'Helado de vainilla con salsa de chocolate',
    price: 3.50,
    calories: 340,
    protein: 6,
    fat: 12,
    carbs: 52,
    enabled: true,
    featured: true,
    order: 1,
    optionGroupIds: ['dessert-extras']
  },
  {
    id: 'dessert-pie',
    categoryId: 'desserts',
    name: 'Pay de Manzana',
    description: 'Pay caliente con canela',
    price: 3.00,
    calories: 240,
    protein: 2,
    fat: 11,
    carbs: 34,
    enabled: true,
    featured: true,
    order: 2,
    optionGroupIds: ['dessert-extras']
  },
  {
    id: 'dessert-cookies',
    categoryId: 'desserts',
    name: 'Galletas con Chispas',
    description: '3 galletas recién horneadas',
    price: 2.50,
    calories: 280,
    protein: 3,
    fat: 13,
    carbs: 38,
    enabled: true,
    featured: false,
    order: 3,
    optionGroupIds: ['dessert-extras']
  },
  {
    id: 'dessert-brownie',
    categoryId: 'desserts',
    name: 'Brownie de Chocolate',
    description: 'Brownie caliente con nueces',
    price: 3.50,
    calories: 380,
    protein: 5,
    fat: 18,
    carbs: 48,
    enabled: true,
    featured: true,
    order: 4,
    optionGroupIds: ['dessert-extras']
  },
];

// Funciones de persistencia
const STORAGE_KEYS = {
  categories: 'menu_categories',
  products: 'menu_products',
  optionGroups: 'menu_optionGroups',
  ingredients: 'menu_ingredients',
  siteConfig: 'menu_siteConfig',
  cacheTimestamp: 'menu_cache_timestamp',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

const isCacheValid = (): boolean => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.cacheTimestamp);
    if (!timestamp) return false;
    
    const lastModified = parseInt(timestamp, 10);
    const now = Date.now();
    const timeDiff = now - lastModified;
    
    return timeDiff < CACHE_DURATION;
  } catch {
    return false;
  }
};

const updateCacheTimestamp = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.cacheTimestamp, Date.now().toString());
  } catch (error) {
    console.error('Error updating cache timestamp:', error);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    // Verificar si el caché es válido antes de cargar
    if (!isCacheValid()) {
      console.log('Cache expired or invalid, using default values');
      updateCacheTimestamp(); // Actualizar timestamp para el nuevo caché
      return defaultValue;
    }
    
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    const sizeInMB = new Blob([serialized]).size / 1024 / 1024;
    
    // Si el tamaño es mayor a 4MB, no guardar (localStorage típicamente tiene límite de 5-10MB)
    if (sizeInMB > 4) {
      console.warn(`${key} is too large (${sizeInMB.toFixed(2)}MB). Skipping localStorage save.`);
      return;
    }
    
    localStorage.setItem(key, serialized);
    
    // Actualizar timestamp del caché cuando se guarden cambios
    updateCacheTimestamp();
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn(`LocalStorage quota exceeded for ${key}. Attempting to clear old data...`);
      
      // Intentar limpiar datos antiguos y reintentar
      try {
        // Limpiar solo este key y reintentar
        localStorage.removeItem(key);
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        updateCacheTimestamp(); // Actualizar timestamp después de guardar
        console.log(`Successfully saved ${key} after clearing.`);
      } catch (retryError) {
        console.error(`Failed to save ${key} even after clearing:`, retryError);
        // Si aún falla, no hacer nada - la app seguirá funcionando con datos en memoria
      }
    } else {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }
};

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [meats, setMeats] = useState<MeatOption[]>(MEATS);
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => 
    loadFromStorage(STORAGE_KEYS.ingredients, DEFAULT_INGREDIENTS)
  );
  const [categories, setCategories] = useState<Category[]>(() => 
    loadFromStorage(STORAGE_KEYS.categories, DEFAULT_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() => 
    loadFromStorage(STORAGE_KEYS.products, DEFAULT_PRODUCTS)
  );
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>(() => 
    loadFromStorage(STORAGE_KEYS.optionGroups, DEFAULT_OPTION_GROUPS)
  );
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => 
    loadFromStorage(STORAGE_KEYS.siteConfig, DEFAULT_CONFIG)
  );

  // Guardar en localStorage cuando cambien los datos
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ingredients, ingredients);
  }, [ingredients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.optionGroups, optionGroups);
  }, [optionGroups]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.siteConfig, siteConfig);
  }, [siteConfig]);

  const updateMeat = (id: string, updates: Partial<MeatOption>) => {
    setMeats(prev => prev.map(meat => 
      meat.id === id ? { ...meat, ...updates } : meat
    ));
  };

  const addMeat = (meat: MeatOption) => {
    setMeats(prev => [...prev, meat]);
  };

  const deleteMeat = (id: string) => {
    setMeats(prev => prev.filter(meat => meat.id !== id));
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, ...updates } : ing
    ));
  };

  const addIngredient = (ingredient: Ingredient) => {
    setIngredients(prev => [...prev, ingredient]);
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
    // También eliminar productos de esa categoría
    setProducts(prev => prev.filter(prod => prod.categoryId !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(prod => 
      prod.id === id ? { ...prod, ...updates } : prod
    ));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(prod => prod.id !== id));
  };

  const updateOptionGroup = (id: string, updates: Partial<ProductOptionGroup>) => {
    setOptionGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ));
  };

  const addOptionGroup = (group: ProductOptionGroup) => {
    setOptionGroups(prev => [...prev, group]);
  };

  const deleteOptionGroup = (id: string) => {
    setOptionGroups(prev => prev.filter(group => group.id !== id));
  };

  const updateSiteConfig = (updates: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos a los valores por defecto? Esta acción no se puede deshacer.')) {
      setIngredients(DEFAULT_INGREDIENTS);
      setCategories(DEFAULT_CATEGORIES);
      setProducts(DEFAULT_PRODUCTS);
      setOptionGroups(DEFAULT_OPTION_GROUPS);
      setSiteConfig(DEFAULT_CONFIG);
      // Limpiar localStorage
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }
  };

  const invalidateCache = () => {
    // Fuerza una actualización del timestamp para invalidar el caché
    updateCacheTimestamp();
    console.log('Cache invalidated - will reload on next page refresh');
  };

  return (
    <MenuContext.Provider value={{
      meats,
      ingredients,
      categories,
      products,
      optionGroups,
      siteConfig,
      updateMeat,
      addMeat,
      deleteMeat,
      updateIngredient,
      addIngredient,
      deleteIngredient,
      updateCategory,
      addCategory,
      deleteCategory,
      updateProduct,
      addProduct,
      deleteProduct,
      updateOptionGroup,
      addOptionGroup,
      deleteOptionGroup,
      updateSiteConfig,
      resetToDefaults,
      invalidateCache,
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within MenuProvider');
  }
  return context;
};
