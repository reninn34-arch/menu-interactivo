import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { MeatOption, Ingredient, Category, Product, SiteConfig, ProductOptionGroup } from '../types';
import { MEATS } from '../constants/meats';
import { storageAdapter } from '../services/storageAdapter';

interface MenuContextType {
  meats: MeatOption[];
  ingredients: Ingredient[];
  categories: Category[];
  products: Product[];
  optionGroups: ProductOptionGroup[];
  siteConfig: SiteConfig;
  isLoading: boolean;
  error: string | null;
  updateMeat: (id: string, updates: Partial<MeatOption>) => void;
  addMeat: (meat: MeatOption) => void;
  deleteMeat: (id: string) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => Promise<void>;
  addIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateOptionGroup: (id: string, updates: Partial<ProductOptionGroup>) => Promise<void>;
  addOptionGroup: (group: ProductOptionGroup) => Promise<void>;
  deleteOptionGroup: (id: string) => Promise<void>;
  updateSiteConfig: (updates: Partial<SiteConfig>) => Promise<void>;
  resetToDefaults: () => void;
  invalidateCache: () => void;
  refetchData: () => Promise<void>;
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
  backgroundColor: '#320A0A',
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
  openingHours: {
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  },
  allowOrdersOutsideHours: false
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
    optionGroupIds: ['meat-type', 'dessert-extras'],
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

const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'localStorage';

export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [meats, setMeats] = useState<MeatOption[]>(MEATS);
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>(DEFAULT_OPTION_GROUPS);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [
        loadedIngredients,
        loadedCategories,
        loadedProducts,
        loadedOptionGroups,
        loadedSiteConfig
      ] = await Promise.all([
        storageAdapter.loadIngredients(DEFAULT_INGREDIENTS),
        storageAdapter.loadCategories(DEFAULT_CATEGORIES),
        storageAdapter.loadProducts(DEFAULT_PRODUCTS),
        storageAdapter.loadOptionGroups(DEFAULT_OPTION_GROUPS),
        storageAdapter.loadSiteConfig(DEFAULT_CONFIG),
      ]);

      setIngredients(loadedIngredients);
      setCategories(loadedCategories);
      setProducts(loadedProducts);
      setOptionGroups(loadedOptionGroups);
      setSiteConfig(loadedSiteConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  //Load data once on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auto-save to storage when data changes (only for localStorage mode)
  useEffect(() => {
    if (STORAGE_MODE === 'localStorage' && !isLoading) {
      storageAdapter.saveIngredients(ingredients);
    }
  }, [ingredients, isLoading]);

  useEffect(() => {
    if (STORAGE_MODE === 'localStorage' && !isLoading) {
      storageAdapter.saveCategories(categories);
    }
  }, [categories, isLoading]);

  useEffect(() => {
    if (STORAGE_MODE === 'localStorage' && !isLoading) {
      storageAdapter.saveProducts(products);
    }
  }, [products, isLoading]);

  useEffect(() => {
    if (STORAGE_MODE === 'localStorage' && !isLoading) {
      storageAdapter.saveOptionGroups(optionGroups);
    }
  }, [optionGroups, isLoading]);

  useEffect(() => {
    if (STORAGE_MODE === 'localStorage' && !isLoading) {
      storageAdapter.saveSiteConfig(siteConfig);
    }
  }, [siteConfig, isLoading]);

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

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    try {
      const ingredient = ingredients.find(i => i.id === id);
      if (!ingredient) return;
      
      const updated = { ...ingredient, ...updates };
      await storageAdapter.updateIngredient(id, updated);
      
      setIngredients(prev => prev.map(ing => 
        ing.id === id ? updated : ing
      ));
    } catch (err) {
      console.error('Failed to update ingredient:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const addIngredient = async (ingredient: Ingredient) => {
    try {
      await storageAdapter.addIngredient(ingredient);
      setIngredients(prev => [...prev, ingredient]);
    } catch (err) {
      console.error('Failed to add ingredient:', err);
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  };

  const deleteIngredient = async (id: string) => {
    try {
      await storageAdapter.deleteIngredient(id);
      setIngredients(prev => prev.filter(ing => ing.id !== id));
    } catch (err) {
      console.error('Failed to delete ingredient:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const category = categories.find(c => c.id === id);
      if (!category) return;
      
      const updated = { ...category, ...updates };
      await storageAdapter.updateCategory(id, updated);
      
      setCategories(prev => prev.map(cat => 
        cat.id === id ? updated : cat
      ));
    } catch (err) {
      console.error('Failed to update category:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const addCategory = async (category: Category) => {
    try {
      await storageAdapter.addCategory(category);
      setCategories(prev => [...prev, category]);
    } catch (err) {
      console.error('Failed to add category:', err);
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await storageAdapter.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      // También eliminar productos de esa categoría
      setProducts(prev => prev.filter(prod => prod.categoryId !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const product = products.find(p => p.id === id);
      if (!product) return;
      
      const updated = { ...product, ...updates };
      await storageAdapter.updateProduct(id, updated);
      
      setProducts(prev => prev.map(prod => 
        prod.id === id ? updated : prod
      ));
    } catch (err) {
      console.error('Failed to update product:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const addProduct = async (product: Product) => {
    try {
      await storageAdapter.addProduct(product);
      setProducts(prev => [...prev, product]);
    } catch (err) {
      console.error('Failed to add product:', err);
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await storageAdapter.deleteProduct(id);
      setProducts(prev => prev.filter(prod => prod.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const updateOptionGroup = async (id: string, updates: Partial<ProductOptionGroup>) => {
    try {
      const group = optionGroups.find(g => g.id === id);
      if (!group) return;
      
      const updated = { ...group, ...updates };
      await storageAdapter.updateOptionGroup(id, updated);
      
      setOptionGroups(prev => prev.map(g => 
        g.id === id ? updated : g
      ));
    } catch (err) {
      console.error('Failed to update option group:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const addOptionGroup = async (group: ProductOptionGroup) => {
    try {
      await storageAdapter.addOptionGroup(group);
      setOptionGroups(prev => [...prev, group]);
    } catch (err) {
      console.error('Failed to add option group:', err);
      setError(err instanceof Error ? err.message : 'Add failed');
    }
  };

  const deleteOptionGroup = async (id: string) => {
    try {
      await storageAdapter.deleteOptionGroup(id);
      setOptionGroups(prev => prev.filter(group => group.id !== id));
    } catch (err) {
      console.error('Failed to delete option group:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const updateSiteConfig = async (updates: Partial<SiteConfig>) => {
    try {
      const updated = { ...siteConfig, ...updates };
      await storageAdapter.saveSiteConfig(updated);
      setSiteConfig(updated);
    } catch (err) {
      console.error('Failed to update site config:', err);
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const resetToDefaults = () => {
    if (confirm('¿Estás seguro de que quieres resetear todos los datos a los valores por defecto? Esta acción no se puede deshacer.')) {
      setIngredients(DEFAULT_INGREDIENTS);
      setCategories(DEFAULT_CATEGORIES);
      setProducts(DEFAULT_PRODUCTS);
      setOptionGroups(DEFAULT_OPTION_GROUPS);
      setSiteConfig(DEFAULT_CONFIG);
      // Limpiar localStorage si está en ese modo
      if (STORAGE_MODE === 'localStorage') {
        localStorage.clear();
      }
    }
  };

  const invalidateCache = () => {
    storageAdapter.invalidateCache();
    console.log('Cache invalidated - will reload on next page refresh');
  };

  const refetchData = async () => {
    await loadInitialData();
  };

  return (
    <MenuContext.Provider value={{
      meats,
      ingredients,
      categories,
      products,
      optionGroups,
      siteConfig,
      isLoading,
      error,
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
      refetchData,
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
