// Códigos de estado HTTP estándar
export const HTTP_STATUS = {
  OK: 200,                    // Respuesta exitosa
  CREATED: 201,               // Recurso creado exitosamente
  BAD_REQUEST: 400,           // Error en la petición del cliente
  INTERNAL_SERVER_ERROR: 500, // Error interno del servidor
  SERVICE_UNAVAILABLE: 503,   // Servicio no disponible
  GATEWAY_TIMEOUT: 504,       // Timeout del gateway
} as const;

// Nombres de los microservicios
export const SERVICES = {
  PYTHON_MS: 'python-ms',
  NODE_MS: 'node-ms',
  ADMIN_MS: 'admin-service',
} as const;

// Rutas base del API Gateway
export const ROUTES = {
  ORDERS: '/api/orders',
  KITCHEN: '/api/kitchen',
} as const;

// Tiempo de espera para peticiones en milisegundos
export const TIMEOUTS = {
  REQUEST: 30000, // Tiempo máximo de espera: 30 segundos
} as const;

// Configuración de reintentos con backoff exponencial
export const RETRY = {
  MAX_ATTEMPTS: 3,    // Número máximo de reintentos ante fallo
  BASE_DELAY: 1000,   // Delay inicial: 1 segundo (luego 2s, 4s...)
} as const;