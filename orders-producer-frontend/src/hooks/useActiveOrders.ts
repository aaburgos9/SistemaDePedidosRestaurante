import { useState, useEffect, useCallback } from 'react';
import { getKitchenOrders } from '../services/orderService';
import type { ApiOrder } from '../types/order';

export type ActiveOrderStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export interface ActiveOrder {
  id: string;
  fullId: string; // Full order ID
  table: string;
  customerName: string;
  status: ActiveOrderStatus;
  timeRemaining: string;
  itemCount: number;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    note?: string | null;
  }[];
}

// Map API status to active order status
const mapApiStatus = (status?: string): ActiveOrderStatus => {
  switch (status) {
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'completed':
      return 'completed';
    default:
      return 'pending';
  }
};

// Calculate time elapsed since order creation
const calculateTimeElapsed = (createdAt: string): string => {
  try {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '< 1 min';
    if (diffMins === 1) return '1 min';
    return `${diffMins} min`;
  } catch {
    return 'N/A';
  }
};

// Map API Order to ActiveOrder
const mapApiOrderToActiveOrder = (order: ApiOrder): ActiveOrder => {
  return {
    id: `#${order.id.slice(0, 4).toUpperCase()}`,
    fullId: order.id,
    table: order.table,
    customerName: order.customerName,
    status: mapApiStatus(order.status),
    timeRemaining: calculateTimeElapsed(order.createdAt),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: order.createdAt,
    items: order.items,
  };
};

export const useActiveOrders = () => {
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getKitchenOrders();
      
      if (response.success && response.data) {
        const orders = Array.isArray(response.data) ? response.data : [response.data];
        
        // Map to active orders (all returned orders are active)
        const active = orders
          .map(mapApiOrderToActiveOrder)
          .sort((a, b) => {
            // Sort by status priority: ready -> preparing -> pending
            const statusPriority: Record<ActiveOrderStatus, number> = {
              ready: 0,
              preparing: 1,
              pending: 2,
                completed: 3
            };
            const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
            if (priorityDiff !== 0) return priorityDiff;
            
            // Within same status, sort by creation time (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        
        setActiveOrders(active);
      }
    } catch (err) {
      console.error('Error fetching active orders:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders on mount
  useEffect(() => {
    fetchActiveOrders();
  }, [fetchActiveOrders]);

  // Update time remaining every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          timeRemaining: calculateTimeElapsed(order.createdAt),
        }))
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Poll for new orders every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveOrders();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [fetchActiveOrders]);

  return {
    activeOrders,
    loading,
    error,
    refetch: fetchActiveOrders,
  };
};
