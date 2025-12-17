import DOMPurify from 'dompurify';

/**
 * Sanitiza texto para prevenir XSS en el frontend
 * @param text Texto a sanitizar
 * @param maxLength Longitud máxima permitida
 * @returns Texto sanitizado
 */
export function sanitizeText(text: string, maxLength: number = 500): string {
  if (!text) return '';
  
  // Sanitizar HTML/JS - solo permitir texto plano
  const sanitized = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], // No permitir ningún tag HTML
    ALLOWED_ATTR: [] // No permitir ningún atributo
  });
  
  // Validar longitud
  if (sanitized.length > maxLength) {
    throw new Error(`Texto muy largo (máximo ${maxLength} caracteres)`);
  }
  
  return sanitized.trim();
}

/**
 * Sanitiza datos de pedido antes de enviar
 */
export function sanitizeOrderData(orderData: any): any {
  try {
    return {
      ...orderData,
      customerName: sanitizeText(orderData.customerName || '', 100),
      table: sanitizeText(orderData.table || '', 50),
      items: orderData.items?.map((item: any) => ({
        ...item,
        productName: sanitizeText(item.productName || '', 100),
        note: item.note ? sanitizeText(item.note, 500) : null
      })) || []
    };
  } catch (error) {
    console.error('❌ Error sanitizing order data:', error);
    throw new Error('Datos del pedido inválidos');
  }
}