export const ADMIN_API_BASE = import.meta.env.VITE_API_GATEWAY_URL || 'https://api-gateway-27263349264.northamerica-south1.run.app';
export const ADMIN_SERVICE_BASE = import.meta.env.VITE_ADMIN_SERVICE_URL || 'https://admin-service-27263349264.northamerica-south1.run.app'; // Direct admin service

export const ADMIN_ENDPOINTS = {
  LOGIN: `${ADMIN_SERVICE_BASE}/admin/auth/login`, // Direct to admin service
  LOGOUT: `${ADMIN_SERVICE_BASE}/admin/auth/logout`,
  USERS: `${ADMIN_API_BASE}/api/admin/users`,
  USER: (id: string) => `${ADMIN_API_BASE}/api/admin/users/${id}`,
  USER_ROLE: (id: string) => `${ADMIN_API_BASE}/api/admin/users/${id}/role`,
  PRODUCTS: `${ADMIN_API_BASE}/api/admin/products`,
  PRODUCT: (id: number) => `${ADMIN_API_BASE}/api/admin/products/${id}`,
  PRODUCT_TOGGLE: (id: number) => `${ADMIN_API_BASE}/api/admin/products/${id}/toggle`,
  DASHBOARD_ORDERS: `${ADMIN_API_BASE}/api/admin/dashboard/orders`,
  DASHBOARD_METRICS: `${ADMIN_API_BASE}/api/admin/dashboard/metrics`,
} as const;
