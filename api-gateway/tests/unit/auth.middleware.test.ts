import { Request, Response, NextFunction } from 'express';
import { verifyJWT, requireRole } from '../../src/middlewares/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-local';

describe('Auth Middleware - Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('verifyJWT', () => {
    it('should return 401 when no authorization header is present', () => {
      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Basic xyz123' };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      const expiredToken = jwt.sign(
        { sub: '123', email: 'test@example.com', roles: ['admin'] },
        JWT_SECRET,
        { expiresIn: '-1h' }
      );
      mockReq.headers = { authorization: `Bearer ${expiredToken}` };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set req.user and call next() when token is valid', () => {
      const validToken = jwt.sign(
        { sub: '123', email: 'test@example.com', roles: ['admin'] },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.id).toBe('123');
      expect(mockReq.user?.email).toBe('test@example.com');
      expect(mockReq.user?.roles).toEqual(['admin']);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle empty Bearer token', () => {
      mockReq.headers = { authorization: 'Bearer ' };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should set empty roles array when roles not in token', () => {
      const tokenWithoutRoles = jwt.sign(
        { sub: '123', email: 'test@example.com' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      mockReq.headers = { authorization: `Bearer ${tokenWithoutRoles}` };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user?.roles).toEqual([]);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle multiple roles in token', () => {
      const multiRoleToken = jwt.sign(
        { sub: '123', email: 'test@example.com', roles: ['admin', 'waiter', 'cook'] },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      mockReq.headers = { authorization: `Bearer ${multiRoleToken}` };

      verifyJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user?.roles).toEqual(['admin', 'waiter', 'cook']);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should return 401 when req.user is not set', () => {
      const middleware = requireRole('admin');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Unauthorized',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      mockReq.user = { id: '123', email: 'test@example.com', roles: ['waiter'] };
      const middleware = requireRole('admin');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Forbidden',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() when user has required role', () => {
      mockReq.user = { id: '123', email: 'test@example.com', roles: ['admin'] };
      const middleware = requireRole('admin');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should allow access when user has multiple roles including required one', () => {
      mockReq.user = { id: '123', email: 'test@example.com', roles: ['waiter', 'admin', 'cook'] };
      const middleware = requireRole('admin');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should work for waiter role', () => {
      mockReq.user = { id: '123', email: 'test@example.com', roles: ['waiter'] };
      const middleware = requireRole('waiter');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should work for cook role', () => {
      mockReq.user = { id: '123', email: 'test@example.com', roles: ['cook'] };
      const middleware = requireRole('cook');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access when user has no roles', () => {
      mockReq.user = { id: '123', email: 'test@example.com', roles: [] };
      const middleware = requireRole('admin');

      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Integration: verifyJWT + requireRole', () => {
    it('should work together in middleware chain', () => {
      const validToken = jwt.sign(
        { sub: '123', email: 'admin@example.com', roles: ['admin'] },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      // First middleware: verifyJWT
      verifyJWT(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Second middleware: requireRole
      const roleMiddleware = requireRole('admin');
      const mockNext2 = jest.fn();
      roleMiddleware(mockReq as Request, mockRes as Response, mockNext2);
      expect(mockNext2).toHaveBeenCalled();
    });

    it('should fail at requireRole when user lacks permission', () => {
      const validToken = jwt.sign(
        { sub: '123', email: 'waiter@example.com', roles: ['waiter'] },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      mockReq.headers = { authorization: `Bearer ${validToken}` };

      // First middleware: verifyJWT
      verifyJWT(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();

      // Second middleware: requireRole (admin)
      const roleMiddleware = requireRole('admin');
      const mockNext2 = jest.fn();
      roleMiddleware(mockReq as Request, mockRes as Response, mockNext2);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext2).not.toHaveBeenCalled();
    });
  });
});
