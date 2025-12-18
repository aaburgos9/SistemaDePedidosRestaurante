import { ADMIN_ENDPOINTS } from '../config/adminApi';
import api from './api';
import { encryptPassword, secureLog } from '../utils/security';

// ✅ Headers for login (only function that still uses fetch directly)
const defaultHeaders = {
  'Content-Type': 'application/json'
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
  
  // ✅ Store tokens in localStorage for Authorization headers
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    console.log('💾 Access token stored in localStorage:', data.accessToken.substring(0, 20) + '...');
  } else {
    console.error('❌ No accessToken in login response:', data);
  }
  
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('💾 Refresh token stored in localStorage');
  } else {
    console.error('❌ No refreshToken in login response:', data);
  }
  
  secureLog.info('🔍 adminLogin response:', { 
    success: data.success, 
    user: data.user ? { ...data.user } : null,
    hasTokens: !!(data.accessToken && data.refreshToken)
  });
  return data;
}

export async function adminLogout() {
  try {
    const response = await api.post('/api/admin/auth/logout');
    // Clear tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('🔓 Tokens cleared from localStorage');
    return response.data;
  } catch (error: any) {
    throw new Error('Logout failed');
  }
}

export async function deleteProduct(id: number) {
  try {
    const response = await api.delete(`/api/admin/products/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error('Product delete failed');
  }
}

export async function fetchUsers(params?: { role?: string; active?: boolean; name?: string }) {
  try {
    const qs = new URLSearchParams();
    if (params?.role) qs.set('role', params.role);
    if (params?.active !== undefined) qs.set('active', String(params.active));
    if (params?.name) qs.set('name', params.name);
    const queryString = qs.toString() ? `?${qs}` : '';
    
    const response = await api.get(`/api/admin/users${queryString}`);
    console.log('📊 fetchUsers raw response:', response.data);
    
    // La respuesta viene como { success: true, data: [...] }
    const users = response.data.data || [];
    return { data: Array.isArray(users) ? users : [] };
  } catch (error: any) {
    throw new Error('Users fetch failed');
  }
}

export async function createUser(payload: { name: string; email: string; password: string; roles: string[] }) {
  try {
    const response = await api.post('/api/admin/users', payload);
    return response.data;
  } catch (error: any) {
    throw new Error('User create failed');
  }
}

export async function updateUser(id: string, payload: Record<string, unknown>) {
  try {
    const response = await api.put(`/api/admin/users/${id}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error('User update failed');
  }
}

export async function setUserRoles(id: string, roles: string[]) {
  try {
    const response = await api.patch(`/api/admin/users/${id}/role`, { roles });
    return response.data;
  } catch (error: any) {
    throw new Error('User role update failed');
  }
}

export async function deleteUser(id: string) {
  try {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error('User delete failed');
  }
}

export async function fetchProducts() {
  try {
    // ✅ Use API service with Authorization header
    const response = await api.get('/api/admin/products');
    console.log('📊 fetchProducts raw response:', response.data);
    const products = response.data.data || [];
    return { data: Array.isArray(products) ? products : [] };
  } catch (error: any) {
    console.error('❌ fetchProducts error:', error);
    throw new Error('Products fetch failed');
  }
}

export async function fetchActiveProducts() {
  try {
    // ✅ Use API service with Authorization header
    const response = await api.get('/api/admin/products/active');
    const products = response.data.data || [];
    return { data: Array.isArray(products) ? products : [] };
  } catch (error: any) {
    console.error('❌ fetchActiveProducts error:', error);
    throw new Error('Active products fetch failed');
  }
}

export async function upsertProduct(id: number | null, payload: Record<string, unknown>) {
  try {
    const response = id 
      ? await api.put(`/api/admin/products/${id}`, payload)
      : await api.post('/api/admin/products', payload);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.response?.data?.error?.message || 'Product upsert failed';
    throw new Error(message);
  }
}

export async function toggleProduct(id: number) {
  try {
    const response = await api.patch(`/api/admin/products/${id}/toggle`);
    return response.data;
  } catch (error: any) {
    throw new Error('Product toggle failed');
  }
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
