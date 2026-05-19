import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Produto } from '../data/mock';

export interface CartItem extends Produto {
  qty: number;
}

interface CartContextData {
  cart: CartItem[];
  count: number;
  total: number;
  addToCart: (p: Produto) => void;
  removeFromCart: (id: number, fornecedor: string) => void;
  updateQty: (id: number, fornecedor: string, delta: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((produto: Produto) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === produto.id && i.fornecedor === produto.fornecedor);
      if (existing) {
        return prev.map(i =>
          i.id === produto.id && i.fornecedor === produto.fornecedor
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }
      return [...prev, { ...produto, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number, fornecedor: string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.fornecedor === fornecedor)));
  }, []);

  const updateQty = useCallback((id: number, fornecedor: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => i.id === id && i.fornecedor === fornecedor ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const total = cart.reduce((sum, i) => sum + i.preco * i.qty, 0);
  const count = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, count, total, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
