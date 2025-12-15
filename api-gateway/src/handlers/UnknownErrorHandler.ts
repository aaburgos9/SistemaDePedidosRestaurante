import { Response } from 'express';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { formatErrorResponse } from '../utils/responseFormatter';
import { HTTP_STATUS } from '../config/constants';

// Handler que maneja TODOS los errores que no tienen un handler específico.
export class UnknownErrorHandler implements IErrorHandler {

  canHandle(_capturedError: any): boolean {
    return true; // ← Siempre acepta
  }

  handle(capturedError: any, httpResponse: Response): void {
    const errorMessage = capturedError.message || 'Internal server error';

    httpResponse.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatErrorResponse(errorMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    );
  }
}