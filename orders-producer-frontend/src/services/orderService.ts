import { API_ENDPOINTS } from '../config/api';
import type { OrderPayload, ApiResponse, ApiOrder } from '../types/order';

/**
 * Create a new order through the API Gateway
 */
export async function createOrder(orderData: OrderPayload): Promise<ApiResponse<ApiOrder>> {
  const response = await fetch(API_ENDPOINTS.CREATE_ORDER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al crear pedido');
  }

  return data;
}

/**
 * Get an order by ID through the API Gateway
 */
export async function getOrderById(orderId: string): Promise<ApiResponse<ApiOrder>> {
  const response = await fetch(API_ENDPOINTS.GET_ORDER(orderId));
  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al obtener pedido');
  }

  return data;
}

/**
 * Get all kitchen orders through the API Gateway
 */
export async function getKitchenOrders(): Promise<ApiResponse<ApiOrder[]>> {
  const response = await fetch(API_ENDPOINTS.KITCHEN_ORDERS);
  
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al obtener pedidos de cocina');
  }

  return data;
}
