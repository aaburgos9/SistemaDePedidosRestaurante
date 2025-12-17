/**
 * Utilidades de seguridad para ofuscar y encriptar datos sensibles
 */

/**
 * Ofusca una contraseña mostrando solo asteriscos (para logs)
 */
export function obfuscatePassword(password: string): string {
  return '*'.repeat(Math.min(password.length, 8)); // Máximo 8 asteriscos
}

/**
 * Encripta una contraseña usando Base64 simple
 * NOTA: En producción usar algoritmos más robustos como bcrypt en el frontend
 */
export function encryptPassword(password: string): string {
  // ✅ Agregar timestamp como salt simple
  const timestamp = Date.now().toString();
  const saltedPassword = `${timestamp}:${password}:${timestamp}`;
  
  // ✅ Codificar en Base64 múltiples veces para ofuscar
  let encrypted = btoa(saltedPassword);
  for (let i = 0; i < 2; i++) {
    encrypted = btoa(encrypted);
  }
  
  // ✅ Agregar prefijo para identificar el método de encriptación
  return `enc_v2_${encrypted}`;
}

/**
 * Desencripta una contraseña encriptada con encryptPassword
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    // ✅ Verificar formato v2
    if (encryptedPassword.startsWith('enc_v2_')) {
      const encrypted = encryptedPassword.replace('enc_v2_', '');
      
      // ✅ Decodificar Base64 múltiples veces
      let decrypted = encrypted;
      for (let i = 0; i < 2; i++) {
        decrypted = atob(decrypted);
      }
      
      // ✅ Una decodificación más si todavía parece Base64
      if (decrypted.match(/^[A-Za-z0-9+/]+=*$/)) {
        decrypted = atob(decrypted);
      }
      
      // ✅ Extraer contraseña del formato timestamp:password:timestamp
      const parts = decrypted.split(':');
      if (parts.length === 3 && parts[0] === parts[2]) {
        return parts[1]; // La contraseña está en el medio
      }
      
      throw new Error('Invalid decrypted format');
    }
    
    // ✅ Soporte para formato v1 (legacy)
    if (encryptedPassword.startsWith('enc_v1_')) {
      const parts = encryptedPassword.replace('enc_v1_', '').split('_');
      if (parts.length !== 2) {
        throw new Error('Invalid encryption format');
      }
      
      const [salt, encrypted] = parts;
      
      let decrypted = encrypted;
      for (let i = 0; i < 3; i++) {
        decrypted = atob(decrypted);
      }
      
      const saltReversed = salt.split('').reverse().join('');
      
      if (decrypted.startsWith(salt)) {
        decrypted = decrypted.substring(salt.length);
      }
      
      if (decrypted.endsWith(saltReversed)) {
        decrypted = decrypted.substring(0, decrypted.length - saltReversed.length);
      }
      
      return decrypted;
    }
    
    throw new Error('Unsupported encryption format');
  } catch (error) {
    throw new Error('Failed to decrypt password');
  }
}

/**
 * Ofusca un email mostrando solo las primeras letras y el dominio
 */
export function obfuscateEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email; // Si no es un email válido, devolver tal como está
  
  const visibleChars = Math.min(3, localPart.length);
  const obfuscatedLocal = localPart.substring(0, visibleChars) + '*'.repeat(Math.max(0, localPart.length - visibleChars));
  
  return `${obfuscatedLocal}@${domain}`;
}

/**
 * Ofusca un objeto removiendo o enmascarando campos sensibles
 */
export function obfuscateSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'secret'];
  const result = { ...obj };
  
  for (const field of sensitiveFields) {
    if (result[field]) {
      if (typeof result[field] === 'string') {
        result[field] = obfuscatePassword(result[field]);
      } else {
        result[field] = '[HIDDEN]';
      }
    }
  }
  
  return result;
}

/**
 * Logger seguro que ofusca automáticamente datos sensibles
 */
export const secureLog = {
  info: (message: string, data?: any) => {
    console.log(message, data ? obfuscateSensitiveData(data) : '');
  },
  error: (message: string, error?: any) => {
    console.error(message, error?.message || error);
  },
  warn: (message: string, data?: any) => {
    console.warn(message, data ? obfuscateSensitiveData(data) : '');
  }
};