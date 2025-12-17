import React, { useEffect, useState } from 'react';
import { useAuth } from '../../store/auth';
import { createUser, fetchUsers, updateUser, deleteUser } from '../../services/adminService';

interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  roles: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const UsersPage: React.FC = () => {
  console.log('🎯 UsersPage rendering');
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (!isAuthenticated) return;
    
    const loadUsers = async () => {
      setLoading(true);
      const res = await fetchUsers({});
      setUsers(res.data || []);
      setLoading(false);
    };
    
    loadUsers();
  }, [isAuthenticated]);


  const [editUser, setEditUser] = useState<User | null>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    roles: 'waiter',
  });
  const [showPassword, setShowPassword] = useState(false);

  const load = React.useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    const res = await fetchUsers({});
    setUsers(res.data || []);
    setLoading(false);
  }, [isAuthenticated]);

  const toggleActive = async (u: User) => {
    if (!isAuthenticated) return;
    await updateUser(String(u._id), { active: !u.active });
    load();
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!isAuthenticated) return;
    if (formState.password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      await createUser({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        roles: formState.roles ? [formState.roles] : ['waiter']
      });
      setFormState({ name: '', email: '', password: '', roles: 'waiter' });
      setShowPassword(false);
      setFormSuccess('Usuario creado exitosamente.');
      setTimeout(() => setFormSuccess(null), 3000);
      load();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setFormError('Error al crear usuario: ' + errorMessage);
    }
  };

  // Formulario de edición de usuario
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    roles: [] as string[],
  });

  React.useEffect(() => {
    if (editUser) {
      setEditForm({
        name: editUser.name || '',
        email: editUser.email || '',
        roles: editUser.roles || [],
      });
    }
  }, [editUser]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const options = (e.target as HTMLSelectElement).options;
      const values: string[] = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) values.push(options[i].value);
      }
      setEditForm(f => ({ ...f, [name]: values }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !editUser) return;
    try {
      await updateUser(String(editUser._id), {
        name: editForm.name,
        email: editForm.email,
        roles: editForm.roles.length ? editForm.roles : ['waiter'],
      });
      setEditUser(null);
      load();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      alert('Error al actualizar usuario: ' + errorMessage);
    }
  };

  const handleEditCancel = () => setEditUser(null);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen pl-64">
      {/* Crear Nuevo Usuario */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Crear Nuevo Usuario</h2>
        {formError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{formError}</div>}
        {formSuccess && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{formSuccess}</div>}
        <form onSubmit={onCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={formState.name}
              onChange={e => setFormState(f => ({...f, name: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formState.email}
              onChange={e => setFormState(f => ({...f, email: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={formState.password}
                onChange={e => setFormState(f => ({...f, password: e.target.value}))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-600"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <select
              value={formState.roles}
              onChange={e => setFormState(f => ({...f, roles: e.target.value}))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="waiter">Mesero</option>
              <option value="cook">Cocinero</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Crear Usuario
          </button>
        </form>
      </div>

      {/* Usuarios Registrados */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Usuarios Registrados ({users.length})</h3>
        {loading ? (
          <div className="w-full flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-solid"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full rounded-xl overflow-hidden font-sans text-[15px]">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 tracking-wide">Usuario</th>
                  <th className="text-left p-4 font-semibold text-gray-700 tracking-wide">Email</th>
                  <th className="text-left p-4 font-semibold text-gray-700 tracking-wide">Roles</th>
                  <th className="text-left p-4 font-semibold text-gray-700 tracking-wide">Estado</th>
                  <th className="text-center p-4 font-semibold text-gray-700 tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100">
                {users.map(u => (
                  <tr key={String(u._id)} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(u.roles||[]).map((role: string) => (
                          <span 
                            key={role}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              role === 'admin' ? 'bg-red-100 text-red-700' :
                              role === 'cook' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}
                          >
                            {role === 'admin' ? '👑 Admin' : role === 'cook' ? '👨‍🍳 Cocinero' : '🍽️ Mesero'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        u.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {u.active ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3 justify-center items-center">
                        <button
                          onClick={() => setEditUser(u)}
                          title="Editar"
                          className="p-2 rounded-full hover:bg-purple-100 text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
                          style={{ fontSize: 0 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M17.211 6.293l-3.504-3.504a1 1 0 0 0-1.414 0l-8 8A1 1 0 0 0 4 12v3a1 1 0 0 0 1 1h3a1 1 0 0 0 .707-.293l8-8a1 1 0 0 0 0-1.414zM5 14v-2.586l7-7L15.586 7l-7 7H5z" />
                          </svg>
                        </button>
                        <button
                          onClick={async () => {
                            if (!isAuthenticated) return;
                            if (window.confirm('¿Seguro que deseas eliminar este usuario?')) {
                              try {
                                await deleteUser(String(u._id));
                                load();
                              } catch {
                                alert('Error al eliminar usuario');
                              }
                            }
                          }}
                          title="Eliminar"
                          className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                          style={{ fontSize: 0 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          title={u.active ? 'Desactivar' : 'Activar'}
                          className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 ${
                            u.active
                              ? 'hover:bg-red-100 text-red-500 focus:ring-red-200'
                              : 'hover:bg-green-100 text-green-600 focus:ring-green-200'
                          }`}
                          style={{ fontSize: 0 }}
                        >
                          {u.active ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <rect x="3" y="8" width="18" height="8" rx="4" fill="#fee2e2" stroke="#ef4444" />
                              <circle cx="8" cy="12" r="3" fill="#ef4444" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <rect x="3" y="8" width="18" height="8" rx="4" fill="#bbf7d0" stroke="#22c55e" />
                              <circle cx="16" cy="12" r="3" fill="#22c55e" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Editar Usuario */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Editar Usuario</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={editForm.name}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editForm.email}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <select
                name="roles"
                multiple
                value={editForm.roles}
                onChange={handleEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="waiter">Mesero</option>
                <option value="cook">Cocinero</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
