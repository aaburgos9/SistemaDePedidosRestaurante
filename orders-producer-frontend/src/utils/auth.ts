/**
 * Utilidades de autenticación
 */

/**
 * Verifica si el usuario está autenticado verificando las cookies
 */
export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: any }> {
  try {
    // Hacer una petición a un endpoint que requiera autenticación
    const response = await fetch('/api/admin/auth/me', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      return { isAuthenticated: true, user: data.user };
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Verifica si hay cookies de autenticación presentes
 */
export function hasAuthCookies(): boolean {
  // Esta es una verificación básica - en un entorno real podrías
  // hacer una petición al servidor para verificar la validez
  return document.cookie.includes('accessToken');
}