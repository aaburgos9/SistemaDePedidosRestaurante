import { Router } from 'express';
import { getDb } from '../../../storage/mongo';
import { requireAuth, requireRole } from '../middlewares/auth';

export const dashboardRouter = Router();

// Orders snapshot: counts by status, recent orders
dashboardRouter.get('/orders', requireAuth, requireRole('admin'), async (_req, res) => {
  const db = getDb();
  const pipeline = [
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ];
  const byStatus = await db.collection('orders').aggregate(pipeline).toArray();
  const recent = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(10).toArray();
  return res.json({ success: true, data: { byStatus, recent } });
});

// Metrics including RabbitMQ queue depth (optional placeholder)
dashboardRouter.get('/metrics', requireAuth, requireRole('admin'), async (_req, res) => {
  const db = getDb();
  const ordersCount = await db.collection('orders').estimatedDocumentCount();
  const activeProducts = await db.collection('products').countDocuments({ enabled: true });
  // If RabbitMQ mgmt API is available, this could fetch queue depth; here return placeholder
  const rabbit = { orders_new_depth: null };
  return res.json({ success: true, data: { ordersCount, activeProducts, rabbit } });
});
