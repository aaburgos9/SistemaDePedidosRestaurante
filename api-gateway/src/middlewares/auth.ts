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
  // ✅ Leer de Authorization header (preferido) o cookie (fallback)
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : req.cookies?.accessToken;
  
  console.log('🔐 verifyJWT Debug:', { 
    path: req.path,
    method: req.method,
    hasAuthHeader: !!authHeader,
    hasToken: !!token, 
    tokenSource: authHeader ? 'Authorization header' : 'Cookie',
    JWT_SECRET_LENGTH: jwtSecret.length,
    tokenLength: token ? token.length : 0,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  if (!token) {
    console.log('❌ No token found in Authorization header or cookies for path:', req.path);
    return res.status(401).json({ success: false, message: 'Unauthorized - No access token' });
  }
  
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    console.log('✅ Token verified for path:', req.path, { sub: payload.sub, email: payload.email, source: authHeader ? 'header' : 'cookie' });
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
