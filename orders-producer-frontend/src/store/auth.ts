import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: { id: string; name: string; email: string; roles: string[] } | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthState['user']) => void;
  clear: () => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      setAuth: (user) => {
        console.log('🔐 Setting auth:', { user });
        // ✅ NO guardar token en localStorage (está en HttpOnly cookie)
        // Solo guardar información del usuario para la UI
        set({ user, isAuthenticated: true });
        console.log('🔐 Auth state updated:', { user, isAuthenticated: true });
      },
      
      clear: () => {
        console.log('🚪 Clearing auth');
        // ✅ NO limpiar localStorage (no hay token ahí)
        set({ user: null, isAuthenticated: false });
      },
      
      logout: async () => {
        console.log('🚪 Logout');
        try {
          // ✅ Usar el servicio de logout
          const { adminLogout } = await import('../services/adminService');
          await adminLogout();
        } catch (error) {
          console.error('Error during logout:', error);
        }
        
        // Limpiar estado local
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage', // nombre único para el storage
      // Solo persistir user e isAuthenticated
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
