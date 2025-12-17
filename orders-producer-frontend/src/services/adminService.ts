import { ADMIN_ENDPOINTS } from '../config/adminApi';
import api from './api';
import { encryptPassword, secureLog } from '../utils/security';

// ✅ Ya no necesitamos authHeaders porque usamos cookies
const defaultHeaders = {
  'Content-Type': 'application/json'
};

const fetchOptions = {
  credentials: 'include' as RequestCredentials // ✅ Enviar cookies automáticamente
};

export async function adminLogin(email: string, password: string) {
  // ✅ Encriptar contraseña antes de enviar
  const encryptedPassword = encryptPassword(password);
  
  // Debug logs (can be removed in production)
  console.log('🔐 Password encrypted successfully, length:', encryptedPassword.length);
  
  secureLog.info('🔐 Login attempt for:', { email, password: 'encrypted' });
  
  const res = await fetch(ADMIN_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: defaultHeaders,
    credentials: 'include', // ✅ Importante para recibir cookie
    body: JSON.stringify({ 
      email, 
      password: encryptedPassword, // ✅ Enviar contraseña encriptada
      _encrypted: true // ✅ Indicar que la contraseña está encriptada
    })
  });
  
  console.log('📥 Login response status:', res.status);
  console.log('📥 Login response ok:', res.ok);
  
  if (!res.ok) {
    console.error('❌ Login request failed with status:', res.status);
    throw new Error('Login failed');
  }
  
  const data = await res.json();
  console.log('📥 Login response data:', data);
  secureLog.info('🔍 adminLogin response:', { 
    success: data.success, 
    user: data.user ? { ...data.user } : null 
  });
  return data;
}

export async function adminLogout() {
  const res = await fetch(ADMIN_ENDPOINTS.LOGOUT, {
    method: 'POST',
    ...fetchOptions
  });
  if (!res.ok) throw new Error('Logout failed');
  return res.json();
}

export async function deleteProduct(id: number) {
  const res = await fetch(ADMIN_ENDPOINTS.PRODUCT(id), {
    method: 'DELETE',
    ...fetchOptions
  });
  if (!res.ok) throw new Error('Product delete failed');
  return res.json();
}

export async function fetchUsers(params?: { role?: string; active?: boolean; name?: string }) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.active !== undefined) qs.set('active', String(params.active));
  if (params?.name) qs.set('name', params.name);
  const url = qs.toString() ? `${ADMIN_ENDPOINTS.USERS}?${qs}` : ADMIN_ENDPOINTS.USERS;
  
  // ✅ Use API service with automatic refresh
  const response = await api.get(url.replace(api.defaults.baseURL || '', ''));
  console.log('📊 fetchUsers raw response:', response.data);
  
  // La respuesta viene como { success: true, data: [...] }
  const users = response.data.data || [];
  return { data: Array.isArray(users) ? users : [] };
}

export async function createUser(payload: { name: string; email: string; password: string; roles: string[] }) {
  const res = await fetch(ADMIN_ENDPOINTS.USERS, {
    method: 'POST',
    headers: defaultHeaders,
    ...fetchOptions,
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('User create failed');
  return res.json();
}

export async function updateUser(id: string, payload: Record<string, unknown>) {
  const res = await fetch(ADMIN_ENDPOINTS.USER(id), {
    method: 'PUT',
    headers: defaultHeaders,
    ...fetchOptions,
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('User update failed');
  return res.json();
}

export async function setUserRoles(id: string, roles: string[]) {
  const res = await fetch(ADMIN_ENDPOINTS.USER_ROLE(id), {
    method: 'PATCH',
    headers: defaultHeaders,
    ...fetchOptions,
    body: JSON.stringify({ roles })
  });
  if (!res.ok) throw new Error('User role update failed');
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(ADMIN_ENDPOINTS.USER(id), {
    method: 'DELETE',
    ...fetchOptions
  });
  if (!res.ok) throw new Error('User delete failed');
  return res.json();
}

export async function fetchProducts() {
  const res = await fetch(ADMIN_ENDPOINTS.PRODUCTS, fetchOptions);
  if (!res.ok) throw new Error('Products fetch failed');
  const response = await res.json();
  console.log('📊 fetchProducts raw response:', response);
  // La respuesta viene como { success: true, data: [...] }
  const products = response.data || [];
  return { data: Array.isArray(products) ? products : [] };
}

export async function fetchActiveProducts() {
  const res = await fetch(`${ADMIN_ENDPOINTS.PRODUCTS}/active`);
  if (!res.ok) throw new Error('Active products fetch failed');
  const response = await res.json();
  const products = response.data || [];
  return { data: Array.isArray(products) ? products : [] };
}

export async function upsertProduct(id: number | null, payload: Record<string, unknown>) {
  const method = id ? 'PUT' : 'POST';
  const url = id ? ADMIN_ENDPOINTS.PRODUCT(id) : ADMIN_ENDPOINTS.PRODUCTS;
  const res = await fetch(url, {
    method,
    headers: defaultHeaders,
    ...fetchOptions,
    body: JSON.stringify(payload)
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok && (!data || !data.success)) {
    throw new Error(data?.message || data?.error?.message || 'Product upsert failed');
  }
  return data;
}

export async function toggleProduct(id: number) {
  const res = await fetch(ADMIN_ENDPOINTS.PRODUCT_TOGGLE(id), { 
    method: 'PATCH', 
    ...fetchOptions 
  });
  if (!res.ok) throw new Error('Product toggle failed');
  return res.json();
}

export async function fetchDashboard() {
  console.log('📊 fetchDashboard using cookies with auto-refresh');
  
  // ✅ Use API service with automatic refresh
  const [ordersRes, metricsRes] = await Promise.all([
    api.get(ADMIN_ENDPOINTS.DASHBOARD_ORDERS.replace(api.defaults.baseURL || '', '')),
    api.get(ADMIN_ENDPOINTS.DASHBOARD_METRICS.replace(api.defaults.baseURL || '', '')),
  ]);
  
  return { orders: ordersRes.data, metrics: metricsRes.data };
}
