import { Response } from 'express';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { formatErrorResponse } from '../utils/responseFormatter';

// Handler especializado en errores que vienen de los microservicios (Axios).
export class MicroserviceErrorHandler implements IErrorHandler {

  canHandle(capturedError: any): boolean {
    return capturedError.response !== undefined;
  }

  handle(capturedError: any, httpResponse: Response): void {
    const statusCode = capturedError.response.status;
    const errorMessage = capturedError.response.data.message || 'Service error';
    const errorDetails = capturedError.response.data;

    httpResponse.status(statusCode).json(
      formatErrorResponse(errorMessage, statusCode, errorDetails)
    );
  }
}