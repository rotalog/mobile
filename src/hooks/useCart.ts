import { useState, useCallback } from 'react';
import { Produto } from '../data/mock';

export interface CartItem extends Produto {
  qty: number;
}

export function useCart() {
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

  return { cart, addToCart, removeFromCart, updateQty, clearCart, total, count };
}
