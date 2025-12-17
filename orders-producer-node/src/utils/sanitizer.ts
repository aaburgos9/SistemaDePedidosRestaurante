import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

// Crear instancia de DOMPurify para Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

/**
 * Sanitiza texto para prevenir XSS
 * @param text Texto a sanitizar
 * @param maxLength Longitud máxima permitida
 * @returns Texto sanitizado
 */
export function sanitizeText(text: string, maxLength: number = 500): string {
  if (!text) return '';
  
  // Sanitizar HTML/JS
  const sanitized = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: [] // No permitir ningún atributo
  });
  
  // Validar longitud
  if (sanitized.length > maxLength) {
    throw new Error(`Text too long (max ${maxLength} characters)`);
  }
  
  return sanitized.trim();
}

/**
 * Sanitiza un objeto OrderItem
 */
export function sanitizeOrderItem(item: any): any {
  return {
    ...item,
    productName: sanitizeText(item.productName, 100),
    note: item.note ? sanitizeText(item.note, 500) : undefined
  };
}

/**
 * Sanitiza datos de pedido completo
 */
export function sanitizeOrderData(orderData: any): any {
  return {
    ...orderData,
    customerName: sanitizeText(orderData.customerName, 100),
    table: sanitizeText(orderData.table, 50),
    items: orderData.items?.map(sanitizeOrderItem) || []
  };
}