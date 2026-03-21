import type { Product, Category, Ingredient, ProductOptionGroup as OptionGroup, SiteConfig } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Storage for JWT token
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // Token expired or invalid — clear it so the admin redirects to login
    setAuthToken(null);
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Health checks
export const healthCheck = {
  server: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },
  database: async () => {
    const response = await fetch(`${API_BASE_URL}/health/db`);
    return response.json();
  },
};

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(error.error || 'Invalid credentials');
    }

    const data = await response.json();
    setAuthToken(data.token);
    return data;
  },

  register: async (username: string, password: string) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  updateCredentials: async (currentPassword: string, newUsername?: string, newPassword?: string) => {
    const response = await fetchWithAuth('/auth/update-credentials', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword,
        newUsername,
        newPassword,
      }),
    });

    // Actualizar el token con las nuevas credenciales
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    return fetchWithAuth('/auth/verify-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },

  logout: () => {
    setAuthToken(null);
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    return fetchWithAuth('/categories');
  },

  getById: async (id: string): Promise<Category> => {
    return fetchWithAuth(`/categories/${id}`);
  },

  create: async (category: Category): Promise<Category> => {
    return fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        enabled: category.enabled,
        order_index: category.order,
        image: category.image,
        is_main: category.isMain,
      }),
    });
  },

  update: async (id: string, category: Category): Promise<Category> => {
    return fetchWithAuth(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: category.name,
        description: category.description,
        icon: category.icon,
        enabled: category.enabled,
        order_index: category.order,
        image: category.image,
        is_main: category.isMain,
      }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Products API
export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    return fetchWithAuth('/products');
  },

  getById: async (id: string): Promise<Product> => {
    return fetchWithAuth(`/products/${id}`);
  },

  create: async (product: Product): Promise<Product> => {
    return fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify({
        id: product.id,
        category_id: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        enabled: product.enabled,
        featured: product.featured,
        order_index: product.order,
        use_layered_view: product.useLayeredView,
        variable_ingredient_id: product.variableIngredientId,
        linked_option_group_id: product.linkedOptionGroupId,
        in_stock: product.inStock,
        estimated_time: product.estimatedTime,
        nutritional_info: product.calories ? { calories: product.calories, protein: product.protein, fat: product.fat, carbs: product.carbs } : null,
        option_groups: product.optionGroupIds,
        ingredients: product.ingredientIds,
      }),
    });
  },

  update: async (id: string, product: Product): Promise<Product> => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        category_id: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        enabled: product.enabled,
        featured: product.featured,
        order_index: product.order,
        use_layered_view: product.useLayeredView,
        variable_ingredient_id: product.variableIngredientId,
        linked_option_group_id: product.linkedOptionGroupId,
        in_stock: product.inStock,
        estimated_time: product.estimatedTime,
        nutritional_info: product.calories ? { calories: product.calories, protein: product.protein, fat: product.fat, carbs: product.carbs } : null,
        option_groups: product.optionGroupIds,
        ingredients: product.ingredientIds,
      }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Ingredients API
export const ingredientsApi = {
  getAll: async (): Promise<Ingredient[]> => {
    return fetchWithAuth('/ingredients');
  },

  getById: async (id: string): Promise<Ingredient> => {
    return fetchWithAuth(`/ingredients/${id}`);
  },

  create: async (ingredient: Ingredient): Promise<Ingredient> => {
    return fetchWithAuth('/ingredients', {
      method: 'POST',
      body: JSON.stringify({
        id: ingredient.id,
        name: ingredient.name,
        type: ingredient.type,
        enabled: ingredient.enabled,
        order_index: ingredient.order,
        is_variable: ingredient.isVariable,
        image: ingredient.image,
      }),
    });
  },

  update: async (id: string, ingredient: Ingredient): Promise<Ingredient> => {
    return fetchWithAuth(`/ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: ingredient.name,
        type: ingredient.type,
        enabled: ingredient.enabled,
        order_index: ingredient.order,
        is_variable: ingredient.isVariable,
        image: ingredient.image,
      }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`/ingredients/${id}`, {
      method: 'DELETE',
    });
  },
};

// Option Groups API
export const optionGroupsApi = {
  getAll: async (): Promise<OptionGroup[]> => {
    return fetchWithAuth('/option-groups');
  },

  getById: async (id: string): Promise<OptionGroup> => {
    return fetchWithAuth(`/option-groups/${id}`);
  },

  create: async (group: OptionGroup): Promise<OptionGroup> => {
    return fetchWithAuth('/option-groups', {
      method: 'POST',
      body: JSON.stringify({
        id: group.id,
        name: group.name,
        description: group.description,
        required: group.required,
        multi_select: group.multiSelect,
        min_selections: group.minSelections,
        max_selections: group.maxSelections,
        enabled: group.enabled,
        order_index: group.order,
        is_3d_layer: group.is3DLayer || false,
        layer_order: group.layerOrder || 5,
        values: group.values.map(v => ({
          id: v.id,
          name: v.name,
          price_modifier: v.priceModifier,
          enabled: v.enabled,
          order_index: v.order,
          image: v.image,
          style: v.style,
          calories: v.calories,
          protein: v.protein,
          fat: v.fat,
          carbs: v.carbs,
        })),
      }),
    });
  },

  update: async (id: string, group: OptionGroup): Promise<OptionGroup> => {
    return fetchWithAuth(`/option-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: group.name,
        description: group.description,
        required: group.required,
        multi_select: group.multiSelect,
        min_selections: group.minSelections,
        max_selections: group.maxSelections,
        enabled: group.enabled,
        order_index: group.order,
        is_3d_layer: group.is3DLayer || false,
        layer_order: group.layerOrder || 5,
        values: group.values.map(v => ({
          id: v.id,
          name: v.name,
          price_modifier: v.priceModifier,
          enabled: v.enabled,
          order_index: v.order,
          image: v.image,
          style: v.style,
          calories: v.calories,
          protein: v.protein,
          fat: v.fat,
          carbs: v.carbs,
        })),
      }),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchWithAuth(`/option-groups/${id}`, {
      method: 'DELETE',
    });
  },
};

// Site Config API
export const siteConfigApi = {
  get: async (): Promise<SiteConfig> => {
    const config = await fetchWithAuth('/site-config');
    // Transform snake_case to camelCase
    return {
      siteName: config.site_name,
      tagline: config.tagline,
      logo: config.logo,
      logoWidth: config.logo_width,
      logoHeight: config.logo_height,
      faviconUrl: config.favicon_url,
      primaryColor: config.primary_color,
      secondaryColor: config.secondary_color,
      backgroundColor: config.background_color,
      textColor: config.text_color,
      accentColor: config.accent_color,
      branchName: config.branch_name,
      currency: config.currency,
      currencySymbol: config.currency_symbol,
      whatsappNumber: config.whatsapp_number,
      whatsappNumberPickup: config.whatsapp_number_pickup,
      whatsappNumberDelivery: config.whatsapp_number_delivery,
      restaurantAddress: config.restaurant_address,
      deliveryCost: config.delivery_cost,
      allowOrdersOutsideHours: config.allow_orders_outside_hours,
      openingHours: config.opening_hours,
      instagram: config.instagram,
      facebook: config.facebook,
      tiktok: config.tiktok,
    };
  },

  update: async (config: SiteConfig): Promise<SiteConfig> => {
    const updated = await fetchWithAuth('/site-config', {
      method: 'PUT',
      body: JSON.stringify({
        site_name: config.siteName,
        tagline: config.tagline,
        logo: config.logo,
        logo_width: config.logoWidth,
        logo_height: config.logoHeight,
        favicon_url: config.faviconUrl,
        primary_color: config.primaryColor,
        secondary_color: config.secondaryColor,
        background_color: config.backgroundColor,
        text_color: config.textColor,
        accent_color: config.accentColor,
        branch_name: config.branchName,
        currency: config.currency,
        currency_symbol: config.currencySymbol,
        whatsapp_number: config.whatsappNumber,
        whatsapp_number_pickup: config.whatsappNumberPickup,
        whatsapp_number_delivery: config.whatsappNumberDelivery,
        restaurant_address: config.restaurantAddress,
        delivery_cost: config.deliveryCost,
        allow_orders_outside_hours: config.allowOrdersOutsideHours,
        opening_hours: config.openingHours,
        instagram: config.instagram,
        facebook: config.facebook,
        tiktok: config.tiktok,
      }),
    });

    // Transform response back to camelCase
    return {
      siteName: updated.site_name,
      tagline: updated.tagline,
      logo: updated.logo,
      logoWidth: updated.logo_width,
      logoHeight: updated.logo_height,
      faviconUrl: updated.favicon_url,
      primaryColor: updated.primary_color,
      secondaryColor: updated.secondary_color,
      backgroundColor: updated.background_color,
      textColor: updated.text_color,
      accentColor: updated.accent_color,
      branchName: updated.branch_name,
      currency: updated.currency,
      currencySymbol: updated.currency_symbol,
      whatsappNumber: updated.whatsapp_number,
      whatsappNumberPickup: updated.whatsapp_number_pickup,
      whatsappNumberDelivery: updated.whatsapp_number_delivery,
      restaurantAddress: updated.restaurant_address,
      deliveryCost: updated.delivery_cost,
      allowOrdersOutsideHours: updated.allow_orders_outside_hours,
      openingHours: updated.opening_hours,
      instagram: updated.instagram,
      facebook: updated.facebook,
      tiktok: updated.tiktok,
    };
  },
};
