import React, { useReducer, useCallback } from 'react';
import type { Product, CartState } from '@/types';
import { CartContext } from '@/context/cart-context';

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const maxStock = Math.max(0, Number(product.stockQuantity || 0));

      if (!product.inStock || maxStock <= 0) {
        return state;
      }

      const safeQuantity = Math.max(1, quantity);
      const existingItem = state.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const nextQuantity = Math.min(existingItem.quantity + safeQuantity, maxStock);

        if (nextQuantity === existingItem.quantity) {
          return state;
        }

        return {
          ...state,
          items: state.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: nextQuantity }
              : item
          ),
        };
      }
      
      return {
        ...state,
        items: [...state.items, { product, quantity: Math.min(safeQuantity, maxStock) }],
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload),
      };
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find(item => item.product.id === productId);

      if (!existingItem) {
        return state;
      }

      const maxStock = Math.max(0, Number(existingItem.product.stockQuantity || 0));

      if (maxStock <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId),
        };
      }

      const safeQuantity = Math.min(Math.max(0, quantity), maxStock);

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId),
        };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === productId ? { ...item, quantity: safeQuantity } : item
        ),
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        total: 0,
      };
    
    default:
      return state;
  }
};

const initialState: CartState = {
  items: [],
  total: 0,
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getItemCount = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  const getTotalPrice = useCallback(() => {
    return state.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }, [state.items]);

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
