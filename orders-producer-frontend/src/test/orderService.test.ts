import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, getOrderById, getKitchenOrders } from '../services/orderService';
import type { OrderPayload, ApiOrder } from '../types/order';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Order Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('createOrder', () => {
    it('creates a new order successfully', async () => {
      const mockOrderData: OrderPayload = {
        customerName: 'Cliente Test',
        table: '5',
        items: [
          { productName: 'Hamburguesa', quantity: 2, unitPrice: 15000, note: null }
        ]
      };

      const mockResponse = {
        success: true,
        data: {
          id: 'order-123',
          ...mockOrderData,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await createOrder(mockOrderData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockOrderData)
        })
      );

      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.id).toBe('order-123');
      }
    });

    it('throws error when API returns error', async () => {
      const mockOrderData: OrderPayload = {
        customerName: 'María García',
        table: '3',
        items: []
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'El pedido debe tener al menos un producto' }
        })
      });

      await expect(createOrder(mockOrderData)).rejects.toThrow('El pedido debe tener al menos un producto');
    });

    it('throws generic error when no error message provided', async () => {
      const mockOrderData: OrderPayload = {
        customerName: 'Test',
        table: '1',
        items: []
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(createOrder(mockOrderData)).rejects.toThrow('Error al crear pedido');
    });

    it('handles network errors', async () => {
      const mockOrderData: OrderPayload = {
        customerName: 'Test',
        table: '1',
        items: []
      };

      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(createOrder(mockOrderData)).rejects.toThrow('Network error');
    });
  });

  describe('getOrderById', () => {
    it('retrieves order by ID successfully', async () => {
      const mockOrder: ApiOrder = {
        id: 'order-456',
        customerName: 'Carlos López',
        table: '7',
        items: [
          { productName: 'Pizza', quantity: 1, unitPrice: 25000, note: null }
        ],
        status: 'preparing',
        createdAt: new Date().toISOString()
      };

      const mockResponse = {
        success: true,
        data: mockOrder
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getOrderById('order-456');

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('order-456'));
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data.id).toBe('order-456');
        expect(result.data.customerName).toBe('Carlos López');
      }
    });

    it('throws error when order not found', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'Pedido no encontrado' }
        })
      });

      await expect(getOrderById('non-existent')).rejects.toThrow('Pedido no encontrado');
    });

    it('throws generic error when API fails without message', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({})
      });

      await expect(getOrderById('order-123')).rejects.toThrow('Error al obtener pedido');
    });
  });

  describe('getKitchenOrders', () => {
    it('retrieves all kitchen orders successfully', async () => {
      const mockOrders: ApiOrder[] = [
        {
          id: 'order-1',
          customerName: 'Juan',
          table: '1',
          items: [],
          status: 'pending',
          createdAt: new Date().toISOString()
        },
        {
          id: 'order-2',
          customerName: 'María',
          table: '2',
          items: [],
          status: 'preparing',
          createdAt: new Date().toISOString()
        }
      ];

      const mockResponse = {
        success: true,
        data: mockOrders
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getKitchenOrders();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('status=all'));
      expect(result.success).toBe(true);
      if (result.data) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].id).toBe('order-1');
      }
    });

    it('returns empty array when no orders available', async () => {
      const mockResponse = {
        success: true,
        data: []
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await getKitchenOrders();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('throws error when API fails', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: { message: 'Error interno del servidor' }
        })
      });

      await expect(getKitchenOrders()).rejects.toThrow('Error interno del servidor');
    });
  });
});
