import { Response } from 'express';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { formatErrorResponse } from '../utils/responseFormatter';
import { HTTP_STATUS } from '../config/constants';

/**
 * Handler especializado en errores de timeout.
 * 
 * ¿Cuándo ocurre ETIMEDOUT?
 * - Cuando el microservicio tarda más de 30 segundos
 * - Cuando hay problemas de red lentos
 */
export class TimeoutErrorHandler implements IErrorHandler {

  canHandle(capturedError: any): boolean {
    return capturedError.code === 'ETIMEDOUT';
  }

  handle(_capturedError: any, httpResponse: Response): void {
    httpResponse.status(HTTP_STATUS.GATEWAY_TIMEOUT).json(
      formatErrorResponse('Request timeout', HTTP_STATUS.GATEWAY_TIMEOUT)
    );
  }
}