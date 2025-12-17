import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrderManagement } from '../hooks/useOrderManagement';
import type { Product } from '../types/order';

describe('useOrderManagement Hook', () => {
  const mockProduct1: Product = {
    id: 1,
    name: 'Hamburguesa',
    price: 15000,
    desc: 'Deliciosa hamburguesa',
    image: '/images/burger.jpg'
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Coca Cola',
    price: 3000,
    desc: 'Bebida refrescante',
    image: '/images/coke.jpg'
  };

  it('initializes with empty order', () => {
    const { result } = renderHook(() => useOrderManagement());

    expect(result.current.order.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('adds product to order', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
    });

    expect(result.current.order.items).toHaveLength(1);
    expect(result.current.order.items[0].name).toBe('Hamburguesa');
    expect(result.current.order.items[0].qty).toBe(1);
  });

  it('increments quantity when adding same product twice', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
      result.current.addToOrder(mockProduct1);
    });

    expect(result.current.order.items).toHaveLength(1);
    expect(result.current.order.items[0].qty).toBe(2);
  });

  it('adds multiple different products', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
      result.current.addToOrder(mockProduct2);
    });

    expect(result.current.order.items).toHaveLength(2);
    expect(result.current.order.items[0].name).toBe('Hamburguesa');
    expect(result.current.order.items[1].name).toBe('Coca Cola');
  });

  it('calculates total correctly', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1); // 15000 x 1
      result.current.addToOrder(mockProduct2); // 3000 x 1
    });

    expect(result.current.total).toBe(18000);
  });

  it('increases quantity with changeQty', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
    });

    act(() => {
      result.current.changeQty(1, 2); // Add 2 more
    });

    expect(result.current.order.items[0].qty).toBe(3);
    expect(result.current.total).toBe(45000); // 15000 x 3
  });

  it('decreases quantity with changeQty', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
      result.current.addToOrder(mockProduct1);
      result.current.addToOrder(mockProduct1);
    });

    act(() => {
      result.current.changeQty(1, -1); // Remove 1
    });

    expect(result.current.order.items[0].qty).toBe(2);
    expect(result.current.total).toBe(30000); // 15000 x 2
  });

  it('removes item when quantity reaches zero', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
    });

    act(() => {
      result.current.changeQty(1, -1); // Remove 1 (qty becomes 0)
    });

    expect(result.current.order.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it('prevents negative quantities', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
    });

    act(() => {
      result.current.changeQty(1, -10); // Try to go negative
    });

    expect(result.current.order.items).toHaveLength(0); // Item removed
  });

  it('adds note to item', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
    });

    act(() => {
      result.current.addNoteToItem(1, 'Sin cebolla');
    });

    expect(result.current.order.items[0].note).toBe('Sin cebolla');
  });

  it('updates existing note', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
      result.current.addNoteToItem(1, 'Sin cebolla');
    });

    act(() => {
      result.current.addNoteToItem(1, 'Con queso extra');
    });

    expect(result.current.order.items[0].note).toBe('Con queso extra');
  });

  it('removes note when empty string provided', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
      result.current.addNoteToItem(1, 'Sin cebolla');
    });

    act(() => {
      result.current.addNoteToItem(1, '');
    });

    expect(result.current.order.items[0].note).toBeUndefined();
  });

  it('clears entire order', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1);
      result.current.addToOrder(mockProduct2);
    });

    expect(result.current.order.items).toHaveLength(2);

    act(() => {
      result.current.clearOrder();
    });

    expect(result.current.order.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it('calculates total with multiple items and quantities', () => {
    const { result } = renderHook(() => useOrderManagement());

    act(() => {
      result.current.addToOrder(mockProduct1); // 15000
      result.current.addToOrder(mockProduct1); // 15000
      result.current.addToOrder(mockProduct2); // 3000
      result.current.addToOrder(mockProduct2); // 3000
      result.current.addToOrder(mockProduct2); // 3000
    });

    // (15000 x 2) + (3000 x 3) = 30000 + 9000 = 39000
    expect(result.current.total).toBe(39000);
  });
});
