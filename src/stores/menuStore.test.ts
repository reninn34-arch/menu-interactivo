import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenuStore } from '../stores/menuStore';
import { Category, Product, SiteConfig } from '../types';

const mockCategory: Category = {
  id: 'burgers',
  name: 'Burgers',
  icon: '🍔',
  enabled: true,
  order: 1,
  isMain: true,
};

const mockProduct: Product = {
  id: 'burger-1',
  categoryId: 'burgers',
  name: 'Classic Burger',
  price: 5.99,
  enabled: true,
  order: 1,
};

const mockSiteConfig: SiteConfig = {
  siteName: 'Test Restaurant',
  tagline: 'Best burgers',
  primaryColor: '#FF9F0A',
  secondaryColor: '#FF7A00',
  backgroundColor: '#111827',
  textColor: '#FFFFFF',
  accentColor: '#FFD700',
  branchName: 'Main',
  currency: 'USD',
  currencySymbol: '$',
};

describe('useMenuStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useMenuStore.getState());
    act(() => {
      result.current.setCategories([]);
      result.current.setProducts([]);
      result.current.setSiteConfig(mockSiteConfig);
    });
  });

  it('should set categories', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setCategories([mockCategory]);
    });

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].id).toBe('burgers');
  });

  it('should set products', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setProducts([mockProduct]);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].price).toBe(5.99);
  });

  it('should set site config', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setSiteConfig(mockSiteConfig);
    });

    expect(result.current.siteConfig?.siteName).toBe('Test Restaurant');
  });

  it('should get enabled categories sorted by order', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setCategories([
        { ...mockCategory, id: 'a', order: 3 },
        { ...mockCategory, id: 'b', order: 1 },
        { ...mockCategory, id: 'c', order: 2 },
      ]);
    });

    const enabled = result.current.getEnabledCategories();
    expect(enabled).toHaveLength(3);
    expect(enabled[0].id).toBe('b');
    expect(enabled[1].id).toBe('c');
    expect(enabled[2].id).toBe('a');
  });

  it('should filter products by category', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setProducts([
        mockProduct,
        { ...mockProduct, id: 'burger-2', categoryId: 'drinks' },
      ]);
    });

    const burgers = result.current.getEnabledProducts('burgers');
    expect(burgers).toHaveLength(1);
    expect(burgers[0].id).toBe('burger-1');
  });

  it('should get all enabled products when no category specified', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setProducts([
        { ...mockProduct, enabled: true },
        { ...mockProduct, id: 'burger-2', enabled: false },
      ]);
    });

    const all = result.current.getEnabledProducts();
    expect(all).toHaveLength(1);
  });

  it('should set loading state', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useMenuStore());
    
    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });
});