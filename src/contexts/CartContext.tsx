import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Product, MeatOption, SelectedOption } from '../types';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  /**
   * Adds a product to the cart with optional customizations
   * 
   * @param product - The product to add
   * @param meat - Selected meat type (optional)
   * @param selectedOptions - Array of selected options/extras
   * @param quantity - Number of items to add (default: 1)
   * @param notes - Special instructions from customer (e.g., "no onions", "extra cheese")
   * 
   * @example
   * addItem(burger, beefMeat, [{groupName: 'Size', values: ['Large']}], 1, 'Well done')
   */
  addItem: (product: Product, meat?: MeatOption, selectedOptions?: SelectedOption[], quantity?: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, meat?: MeatOption, selectedOptions?: SelectedOption[], quantity: number = 1, notes?: string) => {
    setItems(prev => {
      // ✅ Issue 2: Search for an existing item with the same product, meat, and options
      // Use JSON.stringify for deep comparison of selectedOptions array
      const existingItem = prev.find(item =>
        item.product.id === product.id &&
        (item.meat?.id ?? null) === (meat?.id ?? null) &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions) &&
        (item.notes ?? '') === (notes ?? '')
      );

      if (existingItem) {
        // Increment quantity instead of creating a duplicate line
        return prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // New item – create with a unique id
      const itemId = `${product.id}-${meat?.id || 'no-meat'}-${Date.now()}`;
      const newItem: CartItem = {
        id: itemId,
        product,
        meat,
        selectedOptions,
        quantity,
        notes,
      };
      return [...prev, newItem];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const total = items.reduce((sum, item) => {
    const meatPrice = Number(item.meat?.price) || 0;
    const optionsPrice = Array.isArray(item.selectedOptions) 
      ? item.selectedOptions.reduce((optSum, opt) => optSum + (Number(opt.totalPrice) || 0), 0) 
      : 0;
    const basePrice = Number(item.product?.price) || 0;
    const itemPrice = basePrice + meatPrice + optionsPrice;
    const quantity = Number(item.quantity) || 1;
    return sum + (itemPrice * quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
