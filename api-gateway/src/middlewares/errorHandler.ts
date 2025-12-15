import { Request, Response, NextFunction } from 'express';
import { IErrorHandler } from '../interfaces/IErrorHandler';
import { MicroserviceErrorHandler } from '../handlers/MicroserviceErrorHandler';
import { ConnectionRefusedErrorHandler } from '../handlers/ConnectionRefusedErrorHandler';
import { TimeoutErrorHandler } from '../handlers/TimeoutErrorHandler';
import { UnknownErrorHandler } from '../handlers/UnknownErrorHandler';

/**
 * Lista de handlers en orden de prioridad.
 
 * IMPORTANTE: UnknownErrorHandler DEBE ir al final
 * porque siempre retorna true en canHandle().
 */
const errorHandlers: IErrorHandler[] = [
  new MicroserviceErrorHandler(),       
  new ConnectionRefusedErrorHandler(),  
  new TimeoutErrorHandler(),            
  new UnknownErrorHandler(),            
];

/**
 * Middleware principal de manejo de errores.
 */
export const errorHandler = (
  capturedError: any,
  _incomingRequest: Request,
  httpResponse: Response,
  _nextMiddleware: NextFunction
): void => {
  console.error('❌ Error capturado:', capturedError);

  // Recorrer la lista de handlers
  for (const handler of errorHandlers) {
    
    if (handler.canHandle(capturedError)) {
      console.log(`✅ Handler seleccionado: ${handler.constructor.name}`);
      
      handler.handle(capturedError, httpResponse);
      return; 
    }
  }
};

/**
 * Función para agregar nuevos handlers en tiempo de ejecución.
 * 
 * IMPORTANTE: Agrégalo ANTES de UnknownErrorHandler
 * para que tenga prioridad.
 */
export function registerErrorHandler(newHandler: IErrorHandler): void {
  // Insertar antes del último elemento (UnknownErrorHandler)
  const insertPosition = errorHandlers.length - 1;
  errorHandlers.splice(insertPosition, 0, newHandler);
  
  console.log(`📝 Nuevo handler registrado: ${newHandler.constructor.name}`);
}