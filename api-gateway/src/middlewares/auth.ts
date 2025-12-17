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
  // ✅ Leer de cookie en lugar de header Authorization
  const token = req.cookies?.accessToken;
  
  console.log('🔐 verifyJWT:', { 
    hasToken: !!token, 
    JWT_SECRET_LENGTH: JWT_SECRET.length,
    cookiesPresent: !!req.cookies,
    tokenLength: token ? token.length : 0
  });
  
  if (!token) {
    console.log('❌ No token provided in cookies');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ Token verified:', { sub: payload.sub, email: payload.email });
    req.user = { id: payload.sub, email: payload.email, roles: payload.roles || [] };
    return next();
  } catch (err) {
    console.error('❌ Token verification failed:', (err as Error).message);
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
