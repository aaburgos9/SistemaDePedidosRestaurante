import { env } from '../config/environment';
import { RETRY } from '../config/constants';

// Ejecuta una función con reintentos y backoff exponencial
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = env.RETRY_ATTEMPTS
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts) {
        throw error;
      }

      // Calcula delay con backoff exponencial: 1s, 2s, 4s...
      const delay = RETRY.BASE_DELAY * Math.pow(2, attempt - 1);
      console.warn(`⚠️  Retry attempt ${attempt}/${maxAttempts} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}