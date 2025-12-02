// Estructura estándar de respuestas del API Gateway
export interface StandardResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code: number;
    details?: any;
  };
  timestamp: string;
}

// Formatea respuestas exitosas con estructura estándar
export function formatSuccessResponse<T>(data: T, message?: string): StandardResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Formatea respuestas de error con estructura estándar
export function formatErrorResponse(
  message: string,
  code: number,
  details?: any
): StandardResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}