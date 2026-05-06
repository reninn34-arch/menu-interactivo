import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ingredient, Category, Product, ProductOptionGroup, SiteConfig } from '../types';

interface MenuState {
  ingredients: Ingredient[];
  categories: Category[];
  products: Product[];
  optionGroups: ProductOptionGroup[];
  siteConfig: SiteConfig | null;
  isLoading: boolean;
  error: string | null;
  
  setIngredients: (ingredients: Ingredient[]) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setOptionGroups: (optionGroups: ProductOptionGroup[]) => void;
  setSiteConfig: (config: SiteConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  getEnabledCategories: () => Category[];
  getEnabledProducts: (categoryId?: string) => Product[];
  getProductOptionGroups: (productId: string) => ProductOptionGroup[];
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      categories: [],
      products: [],
      optionGroups: [],
      siteConfig: null,
      isLoading: true,
      error: null,

      setIngredients: (ingredients) => set({ ingredients }),
      setCategories: (categories) => set({ categories }),
      setProducts: (products) => set({ products }),
      setOptionGroups: (optionGroups) => set({ optionGroups }),
      setSiteConfig: (siteConfig) => set({ siteConfig }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      getEnabledCategories: () => {
        const { categories } = get();
        return categories
          .filter(c => c.enabled)
          .sort((a, b) => a.order - b.order);
      },

      getEnabledProducts: (categoryId?: string) => {
        const { products } = get();
        let filtered = products.filter(p => p.enabled);
        
        if (categoryId) {
          filtered = filtered.filter(p => p.categoryId === categoryId);
        }
        
        return filtered.sort((a, b) => a.order - b.order);
      },

      getProductOptionGroups: (productId: string) => {
        const { products, optionGroups } = get();
        const product = products.find(p => p.id === productId);
        
        if (!product?.optionGroupIds) return [];
        
        return product.optionGroupIds
          .map(id => optionGroups.find(og => og.id === id))
          .filter((og): og is ProductOptionGroup => og !== undefined && og.enabled)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'menu-storage',
      partialize: (state) => ({
        ingredients: state.ingredients,
        categories: state.categories,
        products: state.products,
        optionGroups: state.optionGroups,
        siteConfig: state.siteConfig,
      }),
    }
  )
);