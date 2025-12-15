import { Router } from 'express';
import { getDb } from '../../../storage/mongo';
import { requireAuth, requireRole } from '../middlewares/auth';
import { z } from 'zod';

export const productsRouter = Router();

const ProductSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2),
  price: z.number().nonnegative(),
  description: z.string().default(''),
  image: z.string().default(''),
  enabled: z.boolean().default(true),
  category: z.string().optional(),
  preparationTime: z.number().int().positive(),
});

// Create product
productsRouter.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = ProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const db = getDb();
  const doc = { ...parsed.data, createdAt: new Date(), updatedAt: new Date() };
  console.log('🟢 Intentando guardar producto:', doc);
  // Solo validar unicidad por name
  const exists = await db.collection('products').findOne({ name: doc.name });
  if (exists) {
    console.log('⚠️ Producto duplicado por name:', doc.name);
    return res.status(409).json({ success: false, message: 'Duplicate product (name)' });
  }
  try {
    const result = await db.collection('products').insertOne(doc);
    console.log('✅ Producto insertado:', result.insertedId);
  } catch (e: any) {
    console.error('❌ Error insertando producto:', e);
    return res.status(500).json({ success: false, message: 'Error inserting product', error: e?.message });
  }
  return res.status(201).json({ success: true, data: doc });
});

// List products (admin only - all products)
productsRouter.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const db = getDb();
  const products = await db.collection('products').find({}).sort({ id: 1 }).toArray();
  return res.json({ success: true, data: products });
});

// List active products (public endpoint for waiters)
productsRouter.get('/active', async (_req, res) => {
  const db = getDb();
  const products = await db.collection('products').find({ enabled: true }).sort({ id: 1 }).toArray();
  return res.json({ success: true, data: products });
});

// Update product
productsRouter.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = ProductSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const idNum = Number(req.params.id);
  if (Number.isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid id' });
  const db = getDb();
  const update = { ...parsed.data, updatedAt: new Date() };
  const result = await db.collection('products').updateOne({ id: idNum }, { $set: update });
  if (!result.matchedCount) return res.status(404).json({ success: false, message: 'Product not found' });
  return res.json({ success: true, message: 'Product updated' });
});

// Toggle enable/disable
productsRouter.patch('/:id/toggle', requireAuth, requireRole('admin'), async (req, res) => {
  console.log('🔒 PATCH /products/:id/toggle headers:', req.headers);
  // Si el middleware de auth agrega req.user, mostrarlo
  if (req.user) {
    console.log('👤 Usuario autenticado:', req.user);
  }
  const idNum = Number(req.params.id);
  if (Number.isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid id' });
  const db = getDb();
  const product = await db.collection('products').findOne({ id: idNum });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const newEnabled = !product.enabled;
  await db.collection('products').updateOne({ id: idNum }, { $set: { enabled: newEnabled, updatedAt: new Date() } });
  return res.json({ success: true, data: { id: idNum, enabled: newEnabled } });
});

// Delete product
productsRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const idNum = Number(req.params.id);
  if (Number.isNaN(idNum)) return res.status(400).json({ success: false, message: 'Invalid id' });
  const db = getDb();
  const result = await db.collection('products').deleteOne({ id: idNum });
  if (!result.deletedCount) return res.status(404).json({ success: false, message: 'Product not found' });
  return res.json({ success: true, message: 'Product deleted' });
});
