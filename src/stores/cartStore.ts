import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, MeatOption, SelectedOption } from '../types';

interface CartState {
  items: CartItem[];
  
  addItem: (product: Product, meat?: MeatOption, selectedOptions?: SelectedOption[], quantity?: number, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, meat, selectedOptions, quantity = 1, notes) => {
        const optionIds = selectedOptions
          ?.map(o => o.valueIds.sort().join(','))
          .sort()
          .join('|') || '';
        
        set((state) => {
          const existingItem = state.items.find(item => {
            if (item.product.id !== product.id) return false;
            if ((item.meat?.id ?? null) !== (meat?.id ?? null)) return false;
            
            const itemOptionIds = item.selectedOptions
              ?.map(o => o.valueIds.sort().join(','))
              .sort()
              .join('|') || '';
            
            if (optionIds !== itemOptionIds) return false;
            return (item.notes ?? '') === (notes ?? '');
          });

          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          const itemId = `${product.id}-${meat?.id || 'none'}-${optionIds || 'none'}-${Date.now()}`;
          return {
            items: [...state.items, {
              id: itemId,
              product,
              meat,
              selectedOptions,
              quantity,
              notes,
            }],
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const selectCartItemCount = (state: { items: CartItem[] }) => 
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state: { items: CartItem[] }) =>
  state.items.reduce((sum, item) => {
    const basePrice = Number(item.product?.price) || 0;
    const meatPrice = Number(item.meat?.price) || 0;
    const optionsPrice = Array.isArray(item.selectedOptions)
      ? item.selectedOptions.reduce((optSum, opt) => optSum + (Number(opt.totalPrice) || 0), 0)
      : 0;
    return sum + ((basePrice + meatPrice + optionsPrice) * item.quantity);
  }, 0);