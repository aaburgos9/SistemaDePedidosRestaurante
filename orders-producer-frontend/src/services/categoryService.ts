import { API_BASE } from './config';

const fetchOptions = {
  credentials: 'include' as RequestCredentials // ✅ Enviar cookies automáticamente
};

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/admin/categories`, fetchOptions);
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


export async function createCategory(name: string) {
  const res = await fetch(`${API_BASE}/api/admin/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    ...fetchOptions,
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al crear categoría');
  return data.data;
}


export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: 'DELETE',
    ...fetchOptions
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Error al eliminar categoría');
  return data;
}
