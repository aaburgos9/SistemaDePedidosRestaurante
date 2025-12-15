import { Router } from 'express';
import { getDb } from '../../../storage/mongo';
import { requireAuth, requireRole } from '../middlewares/auth';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export const usersRouter = Router();

// Cambiar contraseña de usuario por ID (sin autenticación, para reset-password)
// Esta ruta debe ir antes de GET /:id para no ser pisada
usersRouter.put('/:id/password', async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.collection('users').updateOne(
    { _id: objectId },
    { $set: { passwordHash, updatedAt: new Date() } }
  );
  if (!result.matchedCount) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, message: 'Password updated' });
});

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  roles: z.array(z.enum(['waiter', 'cook', 'admin'])).default(['waiter'])
});

const UpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  active: z.boolean().optional(),
  roles: z.array(z.enum(['waiter', 'cook', 'admin'])).optional(),
  password: z.string().min(6).optional()
});

// Create user
usersRouter.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const { name, email, password, roles } = parsed.data;
  const db = getDb();
  const exists = await db.collection('users').findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const doc = { name, email, passwordHash, roles, active: true, createdAt: new Date(), updatedAt: new Date() };
  const result = await db.collection('users').insertOne(doc);
  return res.status(201).json({ success: true, data: { id: result.insertedId, name, email, roles, active: true } });
});

// List users with filters
usersRouter.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const { role, active, name } = req.query as any;
  const filter: any = {};
  if (role) filter.roles = role; // roles contains
  if (active !== undefined) filter.active = active === 'true';
  if (name) filter.name = { $regex: new RegExp(name, 'i') };
  const db = getDb();
  const users = await db.collection('users').find(filter).project({ passwordHash: 0 }).sort({ createdAt: -1 }).toArray();
  return res.json({ success: true, data: users });
});

// Update user
usersRouter.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const id = req.params.id;
  const db = getDb();
  const update: any = { ...parsed.data, updatedAt: new Date() };
  if (update.password) {
    update.passwordHash = await bcrypt.hash(update.password, 10);
    delete update.password;
  }
  const result = await db.collection('users').updateOne({ _id: new (await import('mongodb')).ObjectId(id) }, { $set: update });
  if (!result.matchedCount) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, message: 'User updated' });
});

// Change role (shortcut)
usersRouter.patch('/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  const rolesSchema = z.object({ roles: z.array(z.enum(['waiter', 'cook', 'admin'])).min(1) });
  const parsed = rolesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });
  const db = getDb();
  const result = await db.collection('users').updateOne(
    { _id: new (await import('mongodb')).ObjectId(id) },
    { $set: { roles: parsed.data.roles, updatedAt: new Date() } }
  );
  if (!result.matchedCount) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, message: 'Roles updated' });
});

// Delete user
usersRouter.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const id = req.params.id;
  const db = getDb();
  const result = await db.collection('users').deleteOne({ _id: new (await import('mongodb')).ObjectId(id) });
  if (!result.deletedCount) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, message: 'User deleted' });
});


// Buscar usuario por email (sin autenticación, solo para uso interno de microservicios)
usersRouter.get('/email/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const db = getDb();
  const user = await db.collection('users').findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  // No exponer passwordHash
  const { passwordHash, ...userData } = user;
  return res.json({ success: true, data: userData });
});

// Obtener usuario por ID (sin autenticación, solo para uso interno de microservicios)
usersRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  let objectId;
  try {
    objectId = new ObjectId(id);
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }
  const db = getDb();
  const user = await db.collection('users').findOne({ _id: objectId });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { passwordHash, ...userData } = user;
  return res.json({ success: true, data: userData });
});
