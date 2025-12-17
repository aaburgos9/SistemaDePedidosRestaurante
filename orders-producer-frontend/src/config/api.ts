// API Gateway configuration
export const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://api-gateway-27263349264.northamerica-south1.run.app';

// API Endpoints
export const API_ENDPOINTS = {
  // Orders (Python-MS through API Gateway)
  CREATE_ORDER: `${API_BASE_URL}/api/orders`,
  GET_ORDER: (id: string) => `${API_BASE_URL}/api/orders/${id}`,
  
  // Kitchen (Node-MS through API Gateway)
  KITCHEN_ORDERS: `${API_BASE_URL}/api/kitchen/orders`,
  UPDATE_ORDER: (id: string) => `${API_BASE_URL}/api/kitchen/orders/${id}`,
  UPDATE_ORDER_STATUS: (id: string) => `${API_BASE_URL}/api/kitchen/orders/${id}`,
} as const;
