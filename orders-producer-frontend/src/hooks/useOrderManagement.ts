import { useState, useMemo } from 'react';
import type { Order, Product } from '../types/order';

export const useOrderManagement = () => {
  const [order, setOrder] = useState<Order>({ items: [] });

  const addToOrder = (product: Product) => {
    setOrder((prev: Order) => {
      const existing = prev.items.find((it) => it.id === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.id === product.id ? { ...it, qty: it.qty + 1 } : it
          )
        };
      }
      return { 
        ...prev, 
        items: [...prev.items, { 
          id: product.id,
          name: product.name,
          price: product.price,
          qty: 1 
        }] 
      };
    });
  };

  const changeQty = (productId: number, delta: number) => {
    setOrder((prev: Order) => {
      const items = prev.items
        .map((it) =>
          it.id === productId ? { ...it, qty: Math.max(0, it.qty + delta) } : it
        )
        .filter((it) => it.qty > 0);
      return { ...prev, items };
    });
  };

  const addNoteToItem = (productId: number, note: string) => {
    setOrder((prev: Order) => {
      const items = prev.items.map((it) =>
        it.id === productId ? { ...it, note: note || undefined } : it
      );
      return { ...prev, items };
    });
  };

  const total = useMemo(
    () => order.items.reduce((s: number, it: { price: number; qty: number }) => s + it.price * it.qty, 0),
    [order.items]
  );

  const clearOrder = () => {
    setOrder({ items: [] });
  };

  return {
    order,
    addToOrder,
    changeQty,
    addNoteToItem,
    total,
    clearOrder
  };
};
