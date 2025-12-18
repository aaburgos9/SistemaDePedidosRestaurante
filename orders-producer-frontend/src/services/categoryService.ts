import api from './api'; // ✅ Use API service with Authorization interceptor

export async function fetchCategories() {
  try {
    const response = await api.get('/api/admin/categories');
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener categorías');
  }
}

export async function fetchPublicCategories() {
  try {
    const response = await api.get('/api/admin/categories/public/list');
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener categorías');
  }
}

export async function createCategory(name: string) {
  try {
    const response = await api.post('/api/admin/categories', { name });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear categoría');
  }
}

export async function deleteCategory(id: string) {
  try {
    const response = await api.delete(`/api/admin/categories/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar categoría');
  }
}
