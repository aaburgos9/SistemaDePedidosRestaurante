import { useState, useEffect, useRef, useCallback } from 'react';
import { getKitchenOrders, updateOrderStatus as updateOrderStatusAPI } from '../services/orderService';
import type { ApiOrder } from '../types/order';
import type { OrderStatus } from '../components/KitchenOrderCard';

const KITCHEN_WS_URL = 'ws://localhost:4000';

// Order type matching KitchenOrderCard interface
export interface KitchenOrder {
  id: string;
  fullId: string; // Full order ID for API calls
  customerName: string;
  phone: string;
  time: string;
  table: string;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: OrderStatus;
}

// Map API status to KitchenOrderCard status
const mapApiStatusToOrderStatus = (status?: string): OrderStatus => {
  switch (status) {
    case 'preparing':
      return 'Cooking';
    case 'ready':
      return 'Ready';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'New Order';
  }
};

// Format time from ISO string to local time
const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    // Use default locale to get local time zone
    return date.toLocaleTimeString(undefined, { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
  } catch {
    return 'N/A';
  }
};

// Map API Order to KitchenOrder format
const mapApiOrderToKitchenOrder = (order: ApiOrder): KitchenOrder => {
  const products = (order.items || []).map((item) => ({
    name: item.productName,
    quantity: item.quantity,
    price: item.unitPrice,
  }));

  const total = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);

  return {
    id: `#${order.id.slice(0, 3).toUpperCase()}`,
    fullId: order.id, // Store full ID for API calls
    customerName: order.customerName,
    phone: 'N/A', // Phone not available from API
    time: formatTime(order.createdAt),
    table: order.table,
    products,
    total,
    status: mapApiStatusToOrderStatus(order.status),
  };
};

export const useKitchenOrders = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch orders from API Gateway
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getKitchenOrders();
      if (response.success && response.data) {
        const lista = Array.isArray(response.data) ? response.data : [response.data];
        const incoming = lista.map(mapApiOrderToKitchenOrder);
        // Merge incoming with existing by id, preserve higher-precedence statuses
        setOrders((prev: KitchenOrder[]) => {
          // If no previous orders, just use incoming data directly
          if (prev.length === 0) {
            return incoming;
          }
          
          const statusRank = { 'New Order': 0, 'Cooking': 1, 'Ready': 2, 'Completed': 3, 'Cancelled': 99 };
          const byId = new Map<string, KitchenOrder>();
          
          // Start with incoming orders (latest from API)
          for (const o of incoming) {
            byId.set(o.id, o);
          }
          
          // Update with existing orders only if they have higher-precedence status
          for (const existing of prev) {
            const incoming = byId.get(existing.id);
            if (incoming) {
              const existingRank = statusRank[existing.status] || 0;
              const incomingRank = statusRank[incoming.status] || 0;
              
              // Keep existing status only if it's more advanced
              if (existingRank > incomingRank) {
                byId.set(existing.id, { ...incoming, status: existing.status });
              }
            }
          }
          
          return Array.from(byId.values());
        });
      }
    } catch (err) {
      console.error('Error loading kitchen orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch from API Gateway
    fetchOrders();

    // WebSocket connection for real-time updates
    const connect = () => {
      try {
        wsRef.current = new WebSocket(KITCHEN_WS_URL);

        wsRef.current.onopen = () => {
          console.log('✅ Connected to kitchen WebSocket');
          setConnected(true);
        };

        wsRef.current.onmessage = (event: MessageEvent) => {
          try {
            const msg = JSON.parse(event.data);
            console.log('Kitchen WS message:', msg);

            if (msg.type === 'ORDER_NEW' && msg.order) {
              const newOrder = mapApiOrderToKitchenOrder(msg.order);
              setOrders((prev: KitchenOrder[]) => {
                const exists = prev.some((o: KitchenOrder) => o.id === newOrder.id);
                if (exists) {
                  return prev.map((o: KitchenOrder) => (o.id === newOrder.id ? newOrder : o));
                }
                // Add new orders at the beginning so they appear first
                return [newOrder, ...prev];
              });
            }

            if (msg.type === 'ORDER_UPDATED' && msg.order) {
              const updatedOrder = mapApiOrderToKitchenOrder(msg.order);
              setOrders((prev: KitchenOrder[]) => {
                const exists = prev.some((o: KitchenOrder) => o.fullId === updatedOrder.fullId);
                if (exists) {
                  // Update existing order while preserving status if it's more advanced
                  return prev.map((o: KitchenOrder) => {
                    if (o.fullId === updatedOrder.fullId) {
                      const statusRank = { 'New Order': 0, 'Cooking': 1, 'Ready': 2, 'Completed': 3, 'Cancelled': 99 };
                      const existingRank = statusRank[o.status] || 0;
                      const updatedRank = statusRank[updatedOrder.status] || 0;
                      // Keep existing status if more advanced, otherwise use updated
                      return existingRank > updatedRank ? { ...updatedOrder, status: o.status } : updatedOrder;
                    }
                    return o;
                  });
                }
                // If order doesn't exist, add it
                return [updatedOrder, ...prev];
              });
            }

            if (msg.type === 'ORDER_READY' && msg.id) {
              setOrders((prev: KitchenOrder[]) =>
                prev.map((o: KitchenOrder) =>
                  o.id.includes(msg.id.slice(0, 3).toUpperCase())
                    ? { ...o, status: 'Ready' as OrderStatus }
                    : o
                )
              );
            }

            if (msg.type === 'ORDER_STATUS_UPDATE' && msg.id && msg.status) {
              const newStatus = mapApiStatusToOrderStatus(msg.status);
              setOrders((prev: KitchenOrder[]) =>
                prev.map((o: KitchenOrder) =>
                  o.id.includes(msg.id.slice(0, 3).toUpperCase())
                    ? { ...o, status: newStatus }
                    : o
                )
              );
            }
          } catch (err) {
            console.error('Error processing WS message', err);
          }
        };

        wsRef.current.onclose = () => {
          console.log('❌ WebSocket disconnected');
          setConnected(false);

          // Reconnect after 5 seconds
          reconnectTimerRef.current = setTimeout(() => {
            console.log('🔄 Attempting WebSocket reconnection...');
            connect();
          }, 5000);
        };

        wsRef.current.onerror = (err: Event) => {
          console.error('Kitchen WebSocket error', err);
        };
      } catch (err) {
        console.error('Failed to connect to kitchen WebSocket', err);
      }
    };

    connect();

    // Cleanup
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [fetchOrders]);

  // Update order status locally
  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev: KitchenOrder[]) =>
      prev.map((order: KitchenOrder) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }, []);

  // Handler for starting cooking
  const startCooking = useCallback(async (orderId: string) => {
    // Find the order to get the full ID
    const order = orders.find((o: KitchenOrder) => o.id === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }
    
    try {
      // Update status on backend via API using full ID
      await updateOrderStatusAPI(order.fullId, 'preparing');
      // Update local state
      updateOrderStatus(orderId, 'Cooking');
    } catch (error) {
      console.error('Error updating order status:', error);
      // Optionally show error to user
    }
  }, [orders, updateOrderStatus]);

  // Handler for marking as ready
  const markAsReady = useCallback(async (orderId: string) => {
    // Find the order to get the full ID
    const order = orders.find((o: KitchenOrder) => o.id === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }
    
    try {
      // Update status on backend via API using full ID
      await updateOrderStatusAPI(order.fullId, 'ready');
      // Update local state
      updateOrderStatus(orderId, 'Ready');
    } catch (error) {
      console.error('Error updating order status:', error);
      // Optionally show error to user
    }
  }, [orders, updateOrderStatus]);

  // Handler for completing order
  const completeOrder = useCallback(async (orderId: string) => {
    // Find the order to get the full ID
    const order = orders.find((o: KitchenOrder) => o.id === orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }
    
    try {
      // Update status on backend via API using full ID
      await updateOrderStatusAPI(order.fullId, 'completed');
      // Update local state
      updateOrderStatus(orderId, 'Completed');
    } catch (error) {
      console.error('Error updating order status:', error);
      // Optionally show error to user
    }
  }, [orders, updateOrderStatus]);

  return {
    orders,
    connected,
    loading,
    startCooking,
    markAsReady,
    completeOrder,
    refetch: fetchOrders,
  };
};
