import { useState, useEffect, useRef } from 'react';
import type { Pedido, KitchenOrderMessage, ProductoItem } from '../types/order';

const KITCHEN_WS_URL = 'ws://localhost:4000';

// Helper: mapea el JSON del MS de cocina a la estructura de la tarjeta
const mapOrderToPedido = (order: KitchenOrderMessage): Pedido => {
  const productos: ProductoItem[] = (order.items || []).map((item) => ({
    nombre: item.productName,
    cantidad: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: (item.quantity || 0) * (item.unitPrice || 0),
    note: item.note || null
  }));

  const totalPedido = productos.reduce((acc, p) => acc + p.subtotal, 0);

  return {
    id: order.id,
    mesa: order.table,
    cliente: order.customerName,
    productos,
    especificaciones: productos
      .filter((p) => p.note)
      .map((p) => `${p.nombre}: ${p.note}`),
    total: totalPedido,
    estado: 'pendiente'
  };
};

export const useKitchenWebSocket = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Programar eliminación de un pedido 10s después de "listo"
  const scheduleRemoval = (orderId: string) => {
    setTimeout(() => {
      setPedidos((current: Pedido[]) => current.filter((p) => p.id !== orderId));
    }, 10000);
  };

  useEffect(() => {
    // 1) Carga inicial por HTTP
    const KITCHEN_HTTP_URL = 'http://localhost:3002/kitchen/orders';
    
    const fetchPedidos = async () => {
      try {
        const resp = await fetch(KITCHEN_HTTP_URL);
        if (!resp.ok) {
          throw new Error('Error al obtener pedidos de cocina: ' + resp.status);
        }
        const data = await resp.json();
        const lista = Array.isArray(data) ? data : [data];
        setPedidos(lista.map(mapOrderToPedido));
      } catch (err) {
        console.error('Error cargando pedidos de cocina', err);
      }
    };

    fetchPedidos();

    // 2) Conexión WebSocket con reconexión
    const connect = () => {
      try {
        wsRef.current = new WebSocket(KITCHEN_WS_URL);

        wsRef.current.onopen = () => {
          console.log('✅ Conectado al WebSocket de cocina');
          setConnected(true);
        };

        wsRef.current.onmessage = (event: MessageEvent) => {
          try {
            const msg = JSON.parse(event.data);
            console.log('Mensaje WS cocina:', msg);

            if (msg.type === 'ORDER_NEW' && msg.order) {
              const pedido = mapOrderToPedido(msg.order);
              setPedidos((prev: Pedido[]) => {
                const exists = prev.some((p) => p.id === pedido.id);
                if (exists) {
                  return prev.map((p) => (p.id === pedido.id ? pedido : p));
                }
                return [...prev, pedido];
              });
            }

            if (msg.type === 'ORDER_READY' && msg.id) {
              setPedidos((prev: Pedido[]) =>
                prev.map((p) => (p.id === msg.id ? { ...p, estado: 'listo' as const } : p))
              );
              scheduleRemoval(msg.id);
            }

            if (msg.type === 'QUEUE_EMPTY') {
              console.log('Cola de cocina vacía (QUEUE_EMPTY)');
            }
          } catch (err) {
            console.error('Error procesando mensaje WS cocina', err);
          }
        };

        wsRef.current.onclose = () => {
          console.log('❌ WebSocket desconectado');
          setConnected(false);

          // Reconexión después de 5 segundos
          reconnectTimerRef.current = setTimeout(() => {
            console.log('🔄 Intentando reconectar WebSocket...');
            connect();
          }, 5000);
        };

        wsRef.current.onerror = (err: Event) => {
          console.error('Error en WebSocket de cocina', err);
        };
      } catch (err) {
        console.error('No se pudo conectar al WebSocket de cocina', err);
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
  }, []);

  const cambiarEstado = (id: string, nuevoEstado: 'pendiente' | 'en-preparacion' | 'listo') => {
    setPedidos((prev: Pedido[]) =>
      prev.map((pedido) =>
        pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido
      )
    );

    if (nuevoEstado === 'listo') {
      scheduleRemoval(id);
    }
  };

  return {
    pedidos,
    connected,
    cambiarEstado
  };
};
