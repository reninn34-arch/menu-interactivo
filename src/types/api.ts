/**
 * API Response Interfaces
 *
 * These interfaces represent the raw (snake_case) shapes returned by the backend REST API.
 * They are used exclusively in storageAdapter.ts transform functions to replace `any`
 * and ensure type safety when the backend changes a column name.
 */

export interface OptionValueApiResponse {
  id: string;
  name: string;
  price_modifier: string | number;
  enabled: boolean;
  order_index: number;
  image?: string;
  style?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface OptionGroupApiResponse {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  multi_select: boolean;
  min_selections?: number;
  max_selections?: number;
  enabled: boolean;
  order_index: number;
  is_3d_layer?: boolean;
  layer_order?: number;
  values?: OptionValueApiResponse[];
}

export interface NutritionalInfoApiResponse {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface ProductIngredientApiResponse {
  id: string;
}

export interface ProductOptionGroupApiResponse {
  id: string;
}

export interface ProductApiResponse {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: string | number;
  image?: string;
  enabled: boolean;
  featured?: boolean;
  order_index: number;
  use_layered_view?: boolean;
  variable_ingredient_id?: string;
  linked_option_group_id?: string;
  in_stock?: boolean;
  estimated_time?: number;
  nutritional_info?: NutritionalInfoApiResponse;
  // Flat ID arrays (returned from PUT/POST responses)
  ingredient_ids?: string[];
  option_group_ids?: string[];
  // Nested objects (returned from the products_full view on GET)
  ingredients?: ProductIngredientApiResponse[];
  option_groups?: ProductOptionGroupApiResponse[];
}

export interface CategoryApiResponse {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  order_index: number;
  image?: string;
  is_main?: boolean;
}

export interface IngredientApiResponse {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  order_index: number;
  is_variable?: boolean;
  image?: string;
}
