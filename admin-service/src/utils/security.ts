/**
 * Utilidades de seguridad para el backend
 */

/**
 * Desencripta una contraseña encriptada desde el frontend
 */
export function decryptPassword(encryptedPassword: string): string {
  try {
    // ✅ Verificar formato v2
    if (encryptedPassword.startsWith('enc_v2_')) {
      const encrypted = encryptedPassword.replace('enc_v2_', '');
      
      // ✅ Decodificar Base64 múltiples veces
      let decrypted = encrypted;
      for (let i = 0; i < 2; i++) {
        decrypted = Buffer.from(decrypted, 'base64').toString('utf-8');
      }
      
      // ✅ Una decodificación más si todavía parece Base64
      if (decrypted.match(/^[A-Za-z0-9+/]+=*$/)) {
        decrypted = Buffer.from(decrypted, 'base64').toString('utf-8');
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
        decrypted = Buffer.from(decrypted, 'base64').toString('utf-8');
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
 * Verifica si una contraseña está encriptada
 */
export function isEncryptedPassword(password: string): boolean {
  return typeof password === 'string' && (password.startsWith('enc_v1_') || password.startsWith('enc_v2_'));
}

/**
 * Ofusca datos sensibles para logs del servidor
 */
export function obfuscateSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken'];
  const result = { ...obj };
  
  for (const field of sensitiveFields) {
    if (result[field]) {
      if (typeof result[field] === 'string') {
        result[field] = '[HIDDEN]';
      }
    }
  }
  
  return result;
}

/**
 * Logger seguro para el backend
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