import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'express';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { connectMongo } from './storage/mongo';
import { authRouter } from './transport/http/routes/auth.routes';
import { usersRouter } from './transport/http/routes/users.routes';
import { productsRouter } from './transport/http/routes/products.routes';
import { dashboardRouter } from './transport/http/routes/dashboard.routes';
import { categoriesRouter } from './transport/http/routes/categories.routes';

dotenv.config();

export async function startServer() {
  try {
    await connectMongo();
    const { ensureDefaultAdmin } = await import('./startup/seed');
    await ensureDefaultAdmin();
  } catch (err) {
    console.error('❌ Error durante seed:', err);
  }

  const app = express();
  
  // ✅ Configurar cookie-parser ANTES de las rutas
  app.use(cookieParser());
  
  // ✅ Sanitizar ANTES de procesar requests
  app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`⚠️ Sanitized malicious key: ${key} from ${req.ip}`);
    }
  }));
  
  // Configuración de CORS más flexible
  const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['https://orders-producer-frontend-27263349264.northamerica-south1.run.app'];
  
  app.use(cors({ 
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }));
  app.use(json());

  const PORT = parseInt(process.env.PORT || '8080', 10);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'admin-service',
      timestamp: new Date().toISOString(),
      port: PORT,
      corsOrigins: corsOrigins
    });
  });

  // Root endpoint para debug
  app.get('/', (_req, res) => {
    res.json({ 
      message: 'Admin Service API',
      version: '1.0.0',
      endpoints: [
        '/health',
        '/admin/auth',
        '/admin/users', 
        '/admin/products',
        '/admin/dashboard',
        '/admin/categories'
      ]
    });
  });

  // Routes
  app.use('/admin/auth', authRouter);
  app.use('/admin/users', usersRouter);
  app.use('/admin/products', productsRouter);
  app.use('/admin/dashboard', dashboardRouter);
  app.use('/admin/categories', categoriesRouter);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 admin-service escuchando en puerto ${PORT}`);
    console.log(`🌐 CORS configurado para: ${corsOrigins.join(', ')}`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  });
}
