// Configuración global para tests
// Mock de variables de entorno para evitar errores
process.env.PYTHON_MS_URL = 'http://localhost:8000';
process.env.NODE_MS_URL = 'http://localhost:3002';
process.env.PORT = '3000';
process.env.LOG_LEVEL = 'error'; // Reducir logs durante tests
process.env.REQUEST_TIMEOUT = '5000';
process.env.RETRY_ATTEMPTS = '3';
