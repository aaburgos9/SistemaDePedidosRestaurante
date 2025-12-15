import { API_BASE } from './config';


export async function fetchCategories(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al obtener categorías');
  return data.data;
}

export async function fetchPublicCategories() {
  const res = await fetch(`${API_BASE}/api/admin/categories/public/list`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al obtener categorías');
  return data.data;
}


export async function createCategory(token: string, name: string) {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al crear categoría');
  return data.data;
}


export async function deleteCategory(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al eliminar categoría');
  return data;
}
