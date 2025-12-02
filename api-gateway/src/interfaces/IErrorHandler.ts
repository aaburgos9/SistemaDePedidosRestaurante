import { Response } from 'express';

/**
 * Interfaz que TODOS los manejadores de errores deben cumplir.
 * En código:
 * - Método canHandle: ¿Este handler puede manejar este error?
 * - Método handle: Maneja el error y envía la respuesta
 */
export interface IErrorHandler {
  canHandle(capturedError: any): boolean;
  handle(capturedError: any, httpResponse: Response): void;
}