import { Router } from 'express';
import { getDb } from '../../../storage/mongo';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-local';
const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

authRouter.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Invalid payload' });

  const { email, password } = parsed.data;
  const db = getDb();
  const user = await db.collection('users').findOne({ email });
  if (!user || !user.active) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  console.log('🔐 Generando token con JWT_SECRET:', { JWT_SECRET_VALUE: JWT_SECRET, JWT_SECRET_LENGTH: JWT_SECRET.length });
  const token = jwt.sign({ sub: String(user._id), email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '8h' });
  return res.json({ success: true, data: { token, user: { id: user._id, name: user.name, email: user.email, roles: user.roles } } });
});
