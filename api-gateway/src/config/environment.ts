import dotenv from 'dotenv';

dotenv.config(); // Lee el archivo .env

// Define el contrato de las variables de entorno
interface Environment {
  PORT: number;              // Puerto donde corre el gateway
  PYTHON_MS_URL: string;     // URL del microservicio Python
  NODE_MS_URL: string;       // URL del microservicio Node
  REQUEST_TIMEOUT: number;   // Timeout de peticiones HTTP
  RETRY_ATTEMPTS: number;    // Cantidad de reintentos
}

// Valida que todas las variables obligatorias existan al iniciar
class EnvironmentValidator {
  validate(): Environment {
    const required = ['PYTHON_MS_URL', 'NODE_MS_URL'];
    const missing = required.filter((key) => !process.env[key]);

    // Si falta alguna variable, el sistema NO inicia
    if (missing.length > 0) {
      throw new Error(`Faltan variables requeridas: ${missing.join(', ')}`);
    }

    // Retorna las variables con valores por defecto si no están definidas
    return {
      PORT: parseInt(process.env.PORT || '3000', 10),
      PYTHON_MS_URL: process.env.PYTHON_MS_URL!,
      NODE_MS_URL: process.env.NODE_MS_URL!,
      REQUEST_TIMEOUT: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
      RETRY_ATTEMPTS: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
    };
  }
}

export const env = new EnvironmentValidator().validate();