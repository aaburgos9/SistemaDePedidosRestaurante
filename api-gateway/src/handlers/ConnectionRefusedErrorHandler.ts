import { Response } from 'express';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { formatErrorResponse } from '../utils/responseFormatter';
import { HTTP_STATUS } from '../config/constants';

/**
 * Handler especializado en errores de conexión rechazada.
 * ¿Cuándo ocurre ECONNREFUSED?
 * - Cuando el microservicio está apagado
 * - Cuando el puerto está mal configurado
 * - Cuando hay un firewall bloqueando
 */
export class ConnectionRefusedErrorHandler implements IErrorHandler {

  canHandle(capturedError: any): boolean {
    return capturedError.code === 'ECONNREFUSED';
  }


  handle(_capturedError: any, httpResponse: Response): void {
    httpResponse.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json(
      formatErrorResponse('Service unavailable', HTTP_STATUS.SERVICE_UNAVAILABLE)
    );
  }
}