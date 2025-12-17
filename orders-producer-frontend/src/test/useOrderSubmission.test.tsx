import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrderSubmission } from '../hooks/useOrderSubmission';
import * as orderService from '../services/orderService';
import type { OrderPayload } from '../types/order';

vi.mock('../services/orderService');

describe('useOrderSubmission Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockOrderPayload: OrderPayload = {
    customerName: 'Cliente Test',
    table: '5',
    items: [{ productName: 'Hamburguesa', quantity: 2, unitPrice: 15000, note: null }]
  };

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useOrderSubmission());

    expect(result.current.successMsg).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it('submits order successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'order-123',
        ...mockOrderPayload,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    vi.mocked(orderService.createOrder).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOrderSubmission());

    let submitResult: boolean = false;

    await act(async () => {
      submitResult = await result.current.submitOrder(mockOrderPayload);
    });

    expect(submitResult).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.successMsg).toContain('Cliente Test');
    expect(result.current.successMsg).toContain('mesa 5');
  });

  it('submits order and resets isSubmitting', async () => {
    const mockResponse = {
      success: true,
      data: { ...mockOrderPayload, id: 'order-123', status: 'pending' as const, createdAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    };

    vi.mocked(orderService.createOrder).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOrderSubmission());

    await act(async () => {
      await result.current.submitOrder(mockOrderPayload);
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('sets success message after submission', async () => {
    const mockResponse = {
      success: true,
      data: {
        id: 'order-123',
        ...mockOrderPayload,
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    vi.mocked(orderService.createOrder).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useOrderSubmission());

    await act(async () => {
      await result.current.submitOrder(mockOrderPayload);
    });

    expect(result.current.successMsg).not.toBeNull();
    expect(result.current.successMsg).toContain('Cliente Test');
  });

  it('handles submission error correctly', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useOrderSubmission());

    let submitResult: boolean = true;

    await act(async () => {
      submitResult = await result.current.submitOrder(mockOrderPayload);
    });

    expect(submitResult).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.successMsg).toContain('⚠️');
    expect(result.current.successMsg).toContain('Network error');
  });

  it('handles unknown error type', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useOrderSubmission());

    await act(async () => {
      await result.current.submitOrder(mockOrderPayload);
    });

    expect(result.current.successMsg).toContain('Error desconocido');
  });

  it('sets error message on failure', async () => {
    vi.mocked(orderService.createOrder).mockRejectedValueOnce(
      new Error('Test error')
    );

    const { result } = renderHook(() => useOrderSubmission());

    await act(async () => {
      await result.current.submitOrder(mockOrderPayload);
    });

    expect(result.current.successMsg).toContain('⚠️');
    expect(result.current.successMsg).toContain('Test error');
  });

  it('handles multiple consecutive submissions', async () => {
    const mockResponse1 = {
      success: true,
      data: { ...mockOrderPayload, id: 'order-123', table: '5', status: 'pending' as const, createdAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    };

    const mockResponse2 = {
      success: true,
      data: { ...mockOrderPayload, id: 'order-456', table: '10', status: 'pending' as const, createdAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    };

    vi.mocked(orderService.createOrder)
      .mockResolvedValueOnce(mockResponse1)
      .mockResolvedValueOnce(mockResponse2);

    const { result } = renderHook(() => useOrderSubmission());

    // First submission
    await act(async () => {
      await result.current.submitOrder(mockOrderPayload);
    });

    expect(result.current.successMsg).toContain('mesa 5');

    // Second submission with different table
    await act(async () => {
      await result.current.submitOrder({ ...mockOrderPayload, table: '10' });
    });

    expect(result.current.successMsg).toContain('mesa 10');
  });
});