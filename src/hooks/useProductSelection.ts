import { useState, useMemo, useCallback } from 'react';
import { useMenuStore } from '../stores';
import { Product, Category, ProductOptionGroup, MeatOption } from '../types';
import { isRestaurantOpen } from '../utils/openingHours';

export interface UseProductSelectionResult {
  selectedCategoryId: string;
  selectedProductIndex: number;
  meatIndex: number;
  prevMeatIndex: number;
  categoryProducts: Product[];
  selectedProduct: Product | undefined;
  selectedCategory: Category | undefined;
  linkedGroupId: string;
  meatOptionGroup: ProductOptionGroup | undefined;
  meats: MeatOption[];
  selectedMeat: MeatOption;
  isBurgerCategory: boolean;
  restaurantStatus: ReturnType<typeof isRestaurantOpen>;
  setSelectedCategoryId: (id: string) => void;
  setSelectedProductIndex: (index: number) => void;
  setMeatIndex: (index: number) => void;
  handleMeatChange: (newIndex: number) => void;
  handleCategoryChange: (categoryId: string) => void;
}

export const useProductSelection = (): UseProductSelectionResult => {
  const { products, categories, optionGroups, siteConfig } = useMenuStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [meatIndex, setMeatIndex] = useState(0);
  const [prevMeatIndex, setPrevMeatIndex] = useState(0);

  const categoryProducts = useMemo(() => {
    return products.filter(p => p.enabled && p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const selectedProduct = categoryProducts[selectedProductIndex] || categoryProducts[0];

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const linkedGroupId = selectedProduct?.linkedOptionGroupId || 'meat-type';
  
  const meatOptionGroup = useMemo(() => {
    return optionGroups.find(g => g.id === linkedGroupId);
  }, [optionGroups, linkedGroupId]);

  const isBurgerCategory = selectedCategory?.isMain === true;

  const meats: MeatOption[] = useMemo(() => {
    return meatOptionGroup?.values.filter(v => v.enabled).map(v => ({
      id: v.id,
      name: v.name,
      shortName: v.name,
      style: v.style || 'from-gray-600 to-gray-800',
      price: v.priceModifier,
      calories: v.calories || 0,
      protein: v.protein || 0,
      fat: v.fat || 0,
      carbs: v.carbs || 0,
      image: v.image,
    })) || [];
  }, [meatOptionGroup]);

  const fallbackMeat: MeatOption = { 
    id: 'none', 
    name: 'Original', 
    shortName: '', 
    style: '', 
    price: 0, 
    calories: 0, 
    protein: 0, 
    fat: 0, 
    carbs: 0 
  };
  
  const selectedMeat = meats[meatIndex] || meats[0] || fallbackMeat;

  const restaurantStatus = useMemo(() => {
    return isRestaurantOpen(siteConfig || null);
  }, [siteConfig]);

  const handleMeatChange = useCallback((newIndex: number) => {
    setPrevMeatIndex(meatIndex);
    setMeatIndex(newIndex);
  }, [meatIndex]);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedProductIndex(0);
  }, []);

  return {
    selectedCategoryId,
    selectedProductIndex,
    meatIndex,
    prevMeatIndex,
    categoryProducts,
    selectedProduct,
    selectedCategory,
    linkedGroupId,
    meatOptionGroup,
    meats,
    selectedMeat,
    isBurgerCategory,
    restaurantStatus,
    setSelectedCategoryId,
    setSelectedProductIndex,
    setMeatIndex,
    handleMeatChange,
    handleCategoryChange,
  };
};