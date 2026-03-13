/**
 * Storage Adapter - Abstraction layer for data persistence
 * Supports both localStorage and REST API backends
 */

import type { Product, Category, Ingredient, ProductOptionGroup as OptionGroup, SiteConfig } from '../types';
import * as api from './api';

const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'localStorage';

const STORAGE_KEYS = {
  categories: 'menu_categories',
  products: 'menu_products',
  optionGroups: 'menu_optionGroups',
  ingredients: 'menu_ingredients',
  siteConfig: 'menu_siteConfig',
  cacheTimestamp: 'menu_cache_timestamp',
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// LocalStorage utilities
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

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    if (!isCacheValid()) {
      console.log('Cache expired, using default values');
      updateCacheTimestamp();
      return defaultValue;
    }
    
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    const serialized = JSON.stringify(value);
    const sizeInMB = new Blob([serialized]).size / 1024 / 1024;
    
    if (sizeInMB > 4) {
      console.warn(`${key} is too large (${sizeInMB.toFixed(2)}MB). Skipping localStorage save.`);
      return;
    }
    
    localStorage.setItem(key, serialized);
    updateCacheTimestamp();
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn(`LocalStorage quota exceeded for ${key}. Attempting to clear...`);
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify(value));
        updateCacheTimestamp();
      } catch (retryError) {
        console.error(`Failed to save ${key} after clearing:`, retryError);
      }
    } else {
      console.error(`Error saving ${key}:`, error);
    }
  }
};

// Transform functions for API data
const transformProductFromAPI = (product: any): Product => ({
  id: product.id,
  categoryId: product.category_id,
  name: product.name,
  description: product.description,
  price: parseFloat(product.price),
  image: product.image,
  enabled: product.enabled,
  featured: product.featured,
  order: product.order_index,
  useLayeredView: product.use_layered_view,
  variableIngredientId: product.variable_ingredient_id,
  linkedOptionGroupId: product.linked_option_group_id,
  inStock: product.in_stock,
  estimatedTime: product.estimated_time,
  calories: product.nutritional_info?.calories,
  protein: product.nutritional_info?.protein,
  fat: product.nutritional_info?.fat,
  carbs: product.nutritional_info?.carbs,
  // Handle both shapes: products_full view (arrays of objects) and PUT/POST response (flat ID arrays)
  ingredientIds: product.ingredient_ids
    || product.ingredients?.map((i: any) => i.id)
    || [],
  optionGroupIds: product.option_group_ids
    || product.option_groups?.map((g: any) => g.id)
    || [],
});

const transformCategoryFromAPI = (category: any): Category => ({
  id: category.id,
  name: category.name,
  description: category.description,
  icon: category.icon,
  enabled: category.enabled,
  order: category.order_index,
  image: category.image,
  isMain: category.is_main,
});

const transformIngredientFromAPI = (ingredient: any): Ingredient => ({
  id: ingredient.id,
  name: ingredient.name,
  type: ingredient.type,
  enabled: ingredient.enabled,
  order: ingredient.order_index,
  isVariable: ingredient.is_variable,
  image: ingredient.image,
});

const transformOptionGroupFromAPI = (group: any): OptionGroup => ({
  id: group.id,
  name: group.name,
  description: group.description,
  required: group.required,
  multiSelect: group.multi_select,
  minSelections: group.min_selections,
  maxSelections: group.max_selections,
  enabled: group.enabled,
  order: group.order_index,
  values: group.values?.map((v: any) => ({
    id: v.id,
    name: v.name,
    priceModifier: parseFloat(v.price_modifier || 0),
    enabled: v.enabled,
    order: v.order_index,
    image: v.image,
    style: v.style,
    calories: v.calories,
    protein: v.protein,
    fat: v.fat,
    carbs: v.carbs,
  })) || [],
});

// Storage Adapter Interface
export const storageAdapter = {
  // Categories
  async loadCategories(defaultValue: Category[]): Promise<Category[]> {
    if (STORAGE_MODE === 'api') {
      try {
        const data = await api.categoriesApi.getAll();
        return data.map(transformCategoryFromAPI);
      } catch (error) {
        console.error('Failed to load categories from API:', error);
        return defaultValue;
      }
    }
    return loadFromLocalStorage(STORAGE_KEYS.categories, defaultValue);
  },

  async saveCategories(categories: Category[]): Promise<void> {
    if (STORAGE_MODE === 'api') {
      // API auto-saves on updates, no batch save needed
      return;
    }
    saveToLocalStorage(STORAGE_KEYS.categories, categories);
  },

  async addCategory(category: Category): Promise<Category> {
    if (STORAGE_MODE === 'api') {
      const result = await api.categoriesApi.create(category);
      return transformCategoryFromAPI(result);
    }
    return category;
  },

  async updateCategory(id: string, category: Category): Promise<Category> {
    if (STORAGE_MODE === 'api') {
      const result = await api.categoriesApi.update(id, category);
      return transformCategoryFromAPI(result);
    }
    return category;
  },

  async deleteCategory(id: string): Promise<void> {
    if (STORAGE_MODE === 'api') {
      await api.categoriesApi.delete(id);
    }
  },

  // Products
  async loadProducts(defaultValue: Product[]): Promise<Product[]> {
    if (STORAGE_MODE === 'api') {
      try {
        const data = await api.productsApi.getAll();
        return data.map(transformProductFromAPI);
      } catch (error) {
        console.error('Failed to load products from API:', error);
        return defaultValue;
      }
    }
    return loadFromLocalStorage(STORAGE_KEYS.products, defaultValue);
  },

  async saveProducts(products: Product[]): Promise<void> {
    if (STORAGE_MODE === 'api') {
      return;
    }
    saveToLocalStorage(STORAGE_KEYS.products, products);
  },

  async addProduct(product: Product): Promise<Product> {
    if (STORAGE_MODE === 'api') {
      const result = await api.productsApi.create(product);
      return transformProductFromAPI(result);
    }
    return product;
  },

  async updateProduct(id: string, product: Product): Promise<Product> {
    if (STORAGE_MODE === 'api') {
      const result = await api.productsApi.update(id, product);
      return transformProductFromAPI(result);
    }
    return product;
  },

  async deleteProduct(id: string): Promise<void> {
    if (STORAGE_MODE === 'api') {
      await api.productsApi.delete(id);
    }
  },

  // Ingredients
  async loadIngredients(defaultValue: Ingredient[]): Promise<Ingredient[]> {
    if (STORAGE_MODE === 'api') {
      try {
        const data = await api.ingredientsApi.getAll();
        return data.map(transformIngredientFromAPI);
      } catch (error) {
        console.error('Failed to load ingredients from API:', error);
        return defaultValue;
      }
    }
    return loadFromLocalStorage(STORAGE_KEYS.ingredients, defaultValue);
  },

  async saveIngredients(ingredients: Ingredient[]): Promise<void> {
    if (STORAGE_MODE === 'api') {
      return;
    }
    saveToLocalStorage(STORAGE_KEYS.ingredients, ingredients);
  },

  async addIngredient(ingredient: Ingredient): Promise<Ingredient> {
    if (STORAGE_MODE === 'api') {
      const result = await api.ingredientsApi.create(ingredient);
      return transformIngredientFromAPI(result);
    }
    return ingredient;
  },

  async updateIngredient(id: string, ingredient: Ingredient): Promise<Ingredient> {
    if (STORAGE_MODE === 'api') {
      const result = await api.ingredientsApi.update(id, ingredient);
      return transformIngredientFromAPI(result);
    }
    return ingredient;
  },

  async deleteIngredient(id: string): Promise<void> {
    if (STORAGE_MODE === 'api') {
      await api.ingredientsApi.delete(id);
    }
  },

  // Option Groups
  async loadOptionGroups(defaultValue: OptionGroup[]): Promise<OptionGroup[]> {
    if (STORAGE_MODE === 'api') {
      try {
        const data = await api.optionGroupsApi.getAll();
        return data.map(transformOptionGroupFromAPI);
      } catch (error) {
        console.error('Failed to load option groups from API:', error);
        return defaultValue;
      }
    }
    return loadFromLocalStorage(STORAGE_KEYS.optionGroups, defaultValue);
  },

  async saveOptionGroups(groups: OptionGroup[]): Promise<void> {
    if (STORAGE_MODE === 'api') {
      return;
    }
    saveToLocalStorage(STORAGE_KEYS.optionGroups, groups);
  },

  async addOptionGroup(group: OptionGroup): Promise<OptionGroup> {
    if (STORAGE_MODE === 'api') {
      const result = await api.optionGroupsApi.create(group);
      return transformOptionGroupFromAPI(result);
    }
    return group;
  },

  async updateOptionGroup(id: string, group: OptionGroup): Promise<OptionGroup> {
    if (STORAGE_MODE === 'api') {
      const result = await api.optionGroupsApi.update(id, group);
      return transformOptionGroupFromAPI(result);
    }
    return group;
  },

  async deleteOptionGroup(id: string): Promise<void> {
    if (STORAGE_MODE === 'api') {
      await api.optionGroupsApi.delete(id);
    }
  },

  // Site Config
  async loadSiteConfig(defaultValue: SiteConfig): Promise<SiteConfig> {
    if (STORAGE_MODE === 'api') {
      try {
        return await api.siteConfigApi.get();
      } catch (error) {
        console.error('Failed to load site config from API:', error);
        return defaultValue;
      }
    }
    return loadFromLocalStorage(STORAGE_KEYS.siteConfig, defaultValue);
  },

  async saveSiteConfig(config: SiteConfig): Promise<void> {
    if (STORAGE_MODE === 'api') {
      await api.siteConfigApi.update(config);
    } else {
      saveToLocalStorage(STORAGE_KEYS.siteConfig, config);
    }
  },

  // Cache management
  invalidateCache() {
    if (STORAGE_MODE === 'localStorage') {
      updateCacheTimestamp();
    }
  },
};
