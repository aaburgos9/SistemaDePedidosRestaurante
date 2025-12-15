
import { ObjectId } from 'mongodb';
import { Router } from 'express';
import { getDb } from '../../../storage/mongo';
import { requireAuth, requireRole } from '../middlewares/auth';
import { z } from 'zod';

export const categoriesRouter = Router();

// Eliminar categoría
categoriesRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const db = getDb();
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });
  const result = await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
  if (!result.deletedCount) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
  return res.json({ success: true, message: 'Categoría eliminada' });
});

const CategorySchema = z.object({
  name: z.string().min(2)
});

// Crear categoría
categoriesRouter.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = CategorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Nombre inválido' });
  const db = getDb();
  const exists = await db.collection('categories').findOne({ name: parsed.data.name });
  if (exists) return res.status(409).json({ success: false, message: 'La categoría ya existe' });
  const doc = { name: parsed.data.name, createdAt: new Date() };
  const result = await db.collection('categories').insertOne(doc);
  return res.status(201).json({ success: true, data: { ...doc, _id: result.insertedId } });
});

// Listar categorías (admin only)
categoriesRouter.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const db = getDb();
  const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
  return res.json({ success: true, data: categories });
});

// Listar categorías (público - para meseros)
categoriesRouter.get('/public/list', async (_req, res) => {
  const db = getDb();
  const categories = await db.collection('categories').find({}).sort({ name: 1 }).toArray();
  return res.json({ success: true, data: categories });
});
