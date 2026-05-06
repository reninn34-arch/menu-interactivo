import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore, selectCartItemCount, selectCartTotal } from '../stores/cartStore';
import { CartItem, Product, MeatOption } from '../types';

const mockProduct: Product = {
  id: 'burger-1',
  categoryId: 'burgers',
  name: 'Classic Burger',
  price: 5.99,
  enabled: true,
  order: 1,
};

const mockMeat: MeatOption = {
  id: 'beef',
  name: 'Beef',
  style: 'from-gray-600 to-gray-800',
  price: 0,
  calories: 250,
  protein: 20,
  fat: 15,
  carbs: 0,
  shortName: 'Beef',
};

describe('useCartStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCartStore.getState());
    act(() => {
      result.current.clearCart();
    });
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct, mockMeat, undefined, 1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe('burger-1');
  });

  it('should increment quantity for duplicate items', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct, mockMeat, undefined, 1);
      result.current.addItem(mockProduct, mockMeat, undefined, 1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
  });

  it('should not merge items with different options', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct, mockMeat, undefined, 1);
      result.current.addItem(mockProduct, undefined, undefined, 1);
    });

    expect(result.current.items).toHaveLength(2);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct);
    });

    const itemId = result.current.items[0].id;
    
    act(() => {
      result.current.removeItem(itemId);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct);
    });

    const itemId = result.current.items[0].id;
    
    act(() => {
      result.current.updateQuantity(itemId, 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
  });

  it('should remove item when quantity set to 0', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct);
    });

    const itemId = result.current.items[0].id;
    
    act(() => {
      result.current.updateQuantity(itemId, 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem({ ...mockProduct, id: 'burger-2' });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });
});

describe('selectCartItemCount', () => {
  it('should count total items in cart', () => {
    const state = {
      items: [
        { id: '1', product: mockProduct, quantity: 2 },
        { id: '2', product: { ...mockProduct, id: 'burger-2' }, quantity: 3 },
      ] as CartItem[],
    };

    expect(selectCartItemCount(state)).toBe(5);
  });

  it('should return 0 for empty cart', () => {
    const state = { items: [] as CartItem[] };
    expect(selectCartItemCount(state)).toBe(0);
  });
});

describe('selectCartTotal', () => {
  it('should calculate total with meat price modifier', () => {
    const state = {
      items: [
        { 
          id: '1', 
          product: mockProduct, 
          meat: mockMeat,
          quantity: 1 
        } as CartItem,
      ],
    };

    expect(selectCartTotal(state)).toBe(5.99);
  });

  it('should calculate total with quantity', () => {
    const state = {
      items: [
        { 
          id: '1', 
          product: mockProduct, 
          quantity: 2 
        } as CartItem,
      ],
    };

    expect(selectCartTotal(state)).toBe(11.98);
  });
});