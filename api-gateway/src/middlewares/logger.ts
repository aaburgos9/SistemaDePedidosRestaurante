import { Request, Response, NextFunction } from 'express';

// Middleware para registrar peticiones HTTP
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.path}`);
  next();
};