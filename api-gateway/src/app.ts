import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import { corsConfig } from './middlewares/cors';
import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import ordersRoutes from './routes/orders.routes';
import kitchenRoutes from './routes/kitchen.routes';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';

// Configura y retorna la aplicación Express
export function createApp(): Application {
  const app = express();

  // Middlewares globales
  app.use(corsConfig);
  app.use(express.json());
  app.use(requestLogger);

  // Rutas de la aplicación
  app.use('/api/orders', ordersRoutes);
  app.use('/api/kitchen', kitchenRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/auth', authRoutes);

  // Manejo de errores (debe ir al final)
  app.use(errorHandler);

  return app;
}