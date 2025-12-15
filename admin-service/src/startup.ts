import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'express';
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
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(json());

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'admin-service' }));

  // Routes
  app.use('/admin/auth', authRouter);
  app.use('/admin/users', usersRouter);
  app.use('/admin/products', productsRouter);
  app.use('/admin/dashboard', dashboardRouter);
  app.use('/admin/categories', categoriesRouter);

  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`🚀 admin-service escuchando en puerto ${PORT}`);
  });
}
