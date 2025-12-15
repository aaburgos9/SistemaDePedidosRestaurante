export async function deleteProduct(token: string, id: number) {
  const res = await fetch(ADMIN_ENDPOINTS.PRODUCT(id), {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error('Product delete failed');
  return res.json();
}
import { ADMIN_ENDPOINTS } from '../config/adminApi';

function authHeaders(token?: string): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(ADMIN_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  console.log('🔍 adminLogin raw response:', data);
  return data;
}

export async function fetchUsers(token: string, params?: { role?: string; active?: boolean; name?: string }) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set('role', params.role);
  if (params?.active !== undefined) qs.set('active', String(params.active));
  if (params?.name) qs.set('name', params.name);
  const url = qs.toString() ? `${ADMIN_ENDPOINTS.USERS}?${qs}` : ADMIN_ENDPOINTS.USERS;
  const res = await fetch(url, { headers: { ...authHeaders(token) } });
  if (!res.ok) throw new Error('Users fetch failed');
  const response = await res.json();
  console.log('📊 fetchUsers raw response:', response);
  // La respuesta viene como { success: true, data: [...] }
  const users = response.data || [];
  return { data: Array.isArray(users) ? users : [] };
}

export async function createUser(token: string, payload: { name: string; email: string; password: string; roles: string[] }) {
  const res = await fetch(ADMIN_ENDPOINTS.USERS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('User create failed');
  return res.json();
}

export async function updateUser(token: string, id: string, payload: Record<string, unknown>) {
  const res = await fetch(ADMIN_ENDPOINTS.USER(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('User update failed');
  return res.json();
}

export async function setUserRoles(token: string, id: string, roles: string[]) {
  const res = await fetch(ADMIN_ENDPOINTS.USER_ROLE(id), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ roles })
  });
  if (!res.ok) throw new Error('User role update failed');
  return res.json();
}

export async function deleteUser(token: string, id: string) {
  const res = await fetch(ADMIN_ENDPOINTS.USER(id), {
    method: 'DELETE',
    headers: { ...authHeaders(token) }
  });
  if (!res.ok) throw new Error('User delete failed');
  return res.json();
}

export async function fetchProducts(token: string) {
  const res = await fetch(ADMIN_ENDPOINTS.PRODUCTS, { headers: { ...authHeaders(token) } });
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

export async function upsertProduct(token: string, id: number | null, payload: Record<string, unknown>) {
  const method = id ? 'PUT' : 'POST';
  const url = id ? ADMIN_ENDPOINTS.PRODUCT(id) : ADMIN_ENDPOINTS.PRODUCTS;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
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

export async function toggleProduct(token: string, id: number) {
  const res = await fetch(ADMIN_ENDPOINTS.PRODUCT_TOGGLE(id), { method: 'PATCH', headers: { ...authHeaders(token) } });
  if (!res.ok) throw new Error('Product toggle failed');
  return res.json();
}

export async function fetchDashboard(token: string) {
  console.log('📊 fetchDashboard token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  const headers = authHeaders(token);
  console.log('📊 fetchDashboard headers:', headers);
  const [ordersRes, metricsRes] = await Promise.all([
    fetch(ADMIN_ENDPOINTS.DASHBOARD_ORDERS, { headers }),
    fetch(ADMIN_ENDPOINTS.DASHBOARD_METRICS, { headers }),
  ]);
  if (!ordersRes.ok || !metricsRes.ok) throw new Error('Dashboard fetch failed');
  return { orders: await ordersRes.json(), metrics: await metricsRes.json() };
}
