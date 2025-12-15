import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; roles: string[] };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-local';

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
  console.log('🔐 verifyJWT:', { auth: auth.substring(0, 30), hasToken: !!token, JWT_SECRET_LENGTH: JWT_SECRET.length, JWT_SECRET_VALUE: JWT_SECRET });
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token verified:', { sub: payload.sub, email: payload.email });
    req.user = { id: payload.sub, email: payload.email, roles: payload.roles || [] };
    return next();
  } catch (err) {
    console.error('❌ Token verification failed:', (err as Error).message, { JWT_SECRET_VALUE: JWT_SECRET });
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('👤 requireRole check:', { role, user: req.user, hasRole: req.user?.roles.includes(role) });
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!req.user.roles.includes(role)) {
      console.log('❌ Rol insuficiente:', { required: role, actual: req.user.roles });
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
}
