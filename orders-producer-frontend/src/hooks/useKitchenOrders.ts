import { useState, useEffect, useRef, useCallback } from 'react';
import { getKitchenOrders } from '../services/orderService';
import type { ApiOrder } from '../types/order';
import type { OrderStatus } from '../components/KitchenOrderCard';

const KITCHEN_WS_URL = 'ws://localhost:4000';

// Order type matching KitchenOrderCard interface
export interface KitchenOrder {
  id: string;
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

// Format time from ISO string
const formatTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
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
        // Reverse so newest orders appear first
        setOrders(lista.map(mapApiOrderToKitchenOrder).reverse());
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
              setOrders((prev) => {
                const exists = prev.some((o) => o.id === newOrder.id);
                if (exists) {
                  return prev.map((o) => (o.id === newOrder.id ? newOrder : o));
                }
                // Add new orders at the beginning so they appear first
                return [newOrder, ...prev];
              });
            }

            if (msg.type === 'ORDER_READY' && msg.id) {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id.includes(msg.id.slice(0, 3).toUpperCase())
                    ? { ...o, status: 'Ready' as OrderStatus }
                    : o
                )
              );
            }

            if (msg.type === 'ORDER_STATUS_UPDATE' && msg.id && msg.status) {
              const newStatus = mapApiStatusToOrderStatus(msg.status);
              setOrders((prev) =>
                prev.map((o) =>
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
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  }, []);

  // Handler for starting cooking
  const startCooking = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'Cooking');
    // TODO: Send status update to backend via WebSocket or API
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ORDER_STATUS_UPDATE',
        id: orderId,
        status: 'preparing'
      }));
    }
  }, [updateOrderStatus]);

  // Handler for marking as ready
  const markAsReady = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'Ready');
    // TODO: Send status update to backend via WebSocket or API
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ORDER_STATUS_UPDATE',
        id: orderId,
        status: 'ready'
      }));
    }
  }, [updateOrderStatus]);

  // Handler for completing order
  const completeOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'Completed');
    // TODO: Send status update to backend via WebSocket or API
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ORDER_STATUS_UPDATE',
        id: orderId,
        status: 'completed'
      }));
    }
  }, [updateOrderStatus]);

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
