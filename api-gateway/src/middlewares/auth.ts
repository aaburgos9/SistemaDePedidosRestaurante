import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; roles: string[] };
    }
  }
}

// ✅ Secret obligatorio - no fallback inseguro
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// TypeScript assertion - sabemos que JWT_SECRET no es undefined después de la validación
const jwtSecret: string = JWT_SECRET;

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  // ✅ Leer de cookie en lugar de header Authorization
  const token = req.cookies?.accessToken;
  
  console.log('🔐 verifyJWT Debug:', { 
    path: req.path,
    method: req.method,
    hasToken: !!token, 
    JWT_SECRET_LENGTH: jwtSecret.length,
    cookiesPresent: !!req.cookies,
    cookieNames: req.cookies ? Object.keys(req.cookies) : [],
    tokenLength: token ? token.length : 0,
    rawCookieHeader: req.headers.cookie,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  if (!token) {
    console.log('❌ No accessToken found in cookies for path:', req.path);
    console.log('🔍 Available cookies:', req.cookies);
    return res.status(401).json({ success: false, message: 'Unauthorized - No access token' });
  }
  
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    console.log('✅ Token verified for path:', req.path, { sub: payload.sub, email: payload.email });
    req.user = { id: payload.sub, email: payload.email, roles: payload.roles || [] };
    return next();
  } catch (err) {
    console.error('❌ Token verification failed for path:', req.path, (err as Error).message);
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
