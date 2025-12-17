
import React, { useState, useEffect } from 'react';

import { fetchCategories, createCategory, deleteCategory } from '../../services/categoryService';
import { useAuth } from '../../store/auth';


const SettingsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'message' in e) {
        setError((e as { message?: string }).message || 'Error al cargar categorías');
      } else {
        setError('Error al cargar categorías');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // Evitar llamada directa a setState en el cuerpo del efecto
    (async () => {
      await loadCategories();
    })();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const name = newCategory.trim();
    if (!name) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setError('La categoría ya existe.');
      return;
    }
    if (!isAuthenticated) return;
    try {
      await createCategory(name);
      setSuccess('Categoría creada correctamente.');
      setNewCategory('');
      loadCategories();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'message' in e) {
        setError((e as { message?: string }).message || 'Error al crear categoría');
      } else {
        setError('Error al crear categoría');
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setError(null);
    setSuccess(null);
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    if (!isAuthenticated) return;
    try {
      await deleteCategory(id);
      setSuccess('Categoría eliminada correctamente.');
      loadCategories();
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'message' in e) {
        setError((e as { message?: string }).message || 'Error al eliminar categoría');
      } else {
        setError('Error al eliminar categoría');
      }
    }
  };

  return (
    <div className="p-8 pl-64">
      <h2 className="text-2xl font-bold mb-6">⚙️ Configuración de Categorías</h2>
      <form onSubmit={handleAddCategory} className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-semibold mb-2">Nueva categoría</label>
          <input
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ej: Hamburguesas"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-green-700 transition-all shadow-lg"
        >
          Crear
        </button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <h3 className="text-lg font-bold mb-2">Categorías existentes</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading && (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-500 border-solid"></div>
          </div>
        )}
        {!loading && categories.length === 0 && <div className="text-gray-500 col-span-full">No hay categorías registradas.</div>}
        {categories.map(cat => (
          <div
            key={cat._id}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-all"
          >
            <span className="font-medium text-gray-800 truncate">{cat.name}</span>
            <button
              onClick={() => handleDeleteCategory(cat._id)}
              title="Eliminar"
              className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 ml-4"
              style={{ fontSize: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;
