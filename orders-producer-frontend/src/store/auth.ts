import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { id: string; name: string; email: string; roles: string[] } | null;
  setAuth: (token: string, user: AuthState['user']) => void;
  clear: () => void;
}

// Cargar datos desde localStorage al iniciar
const loadFromStorage = () => {
  try {
    const token = localStorage.getItem('admin_token');
    const userStr = localStorage.getItem('admin_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const initialState = loadFromStorage();

export const useAuth = create<AuthState>((set) => ({
  token: initialState.token,
  user: initialState.user,
  setAuth: (token, user) => {
    console.log('🔐 Setting auth:', { token: token ? token.substring(0, 20) + '...' : null, user });
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ token, user });
  },
  clear: () => {
    console.log('🚪 Clearing auth');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ token: null, user: null });
  }
}));
