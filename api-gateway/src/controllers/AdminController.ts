import { Request, Response, NextFunction } from 'express';
import { AdminProxyService } from '../services/AdminProxyService';
import { formatSuccessResponse } from '../utils/responseFormatter';
import { HTTP_STATUS } from '../config/constants';

export class AdminController {
	private proxy: AdminProxyService;
	constructor(proxy: AdminProxyService) { this.proxy = proxy; }

	// Categorías
	listCategories = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/categories', 'GET', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	listPublicCategories = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const r = await this.proxy.forward('/admin/categories/public/list', 'GET', undefined, {});
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	createCategory = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/categories', 'POST', req.body, headers);
			res.status(HTTP_STATUS.CREATED).json(r.data);
		} catch (e) { next(e); }
	};
	deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/categories/${req.params.id}`, 'DELETE', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};

	// Auth
	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Security: Do not log request body as it contains credentials
			console.log('🔗 Proxy baseURL:', this.proxy.getBaseURL());
			const r = await this.proxy.forward('/admin/auth/login', 'POST', req.body, {});
			
			console.log('🍪 Login response headers:', Object.keys(r.headers || {}));
			
			// Forward cookies from admin service to client with correct domain settings
			if (r.headers && r.headers['set-cookie']) {
				console.log('🍪 Setting cookies from admin service:', r.headers['set-cookie'].length);
				
				// Parse and re-set cookies with API Gateway domain settings
				r.headers['set-cookie'].forEach((cookieString: string) => {
					// Extract cookie name and value
					const [nameValue, ...attributes] = cookieString.split(';');
					const [name, value] = nameValue.split('=');
					
					// Set cookie with API Gateway appropriate settings
					if (name.trim() === 'accessToken') {
						res.cookie('accessToken', value, {
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax',
							maxAge: 15 * 60 * 1000 // 15 minutes
						});
					} else if (name.trim() === 'refreshToken') {
						res.cookie('refreshToken', value, {
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax',
							maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
							path: '/api/admin/auth'
						});
					}
				});
			} else {
				console.warn('⚠️ No cookies received from admin service');
			}
			
			// Security: Do not log login response as it contains tokens
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) {
			console.error('❌ Login error:', e);
			next(e);
		}
	};

	refresh = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Forward cookies from client to admin service
			const headers: Record<string, string> = {};
			if (req.headers.cookie) {
				headers.cookie = req.headers.cookie;
				console.log('🍪 Forwarding cookies to admin service for refresh');
			} else {
				console.warn('⚠️ No cookies received from client for refresh');
			}
			
			const r = await this.proxy.forward('/admin/auth/refresh', 'POST', req.body, headers);
			
			// Forward cookies from admin service to client with correct domain settings
			if (r.headers && r.headers['set-cookie']) {
				console.log('🍪 Setting refreshed cookies from admin service');
				
				// Parse and re-set cookies with API Gateway appropriate settings
				r.headers['set-cookie'].forEach((cookieString: string) => {
					const [nameValue, ...attributes] = cookieString.split(';');
					const [name, value] = nameValue.split('=');
					
					if (name.trim() === 'accessToken') {
						res.cookie('accessToken', value, {
							httpOnly: true,
							secure: process.env.NODE_ENV === 'production',
							sameSite: 'lax',
							maxAge: 15 * 60 * 1000 // 15 minutes
						});
					}
				});
			}
			
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) {
			console.error('❌ Refresh error:', e);
			next(e);
		}
	};

	logout = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Forward cookies from client to admin service
			const headers: Record<string, string> = {};
			if (req.headers.cookie) {
				headers.cookie = req.headers.cookie;
			}
			
			const r = await this.proxy.forward('/admin/auth/logout', 'POST', req.body, headers);
			
			// Forward cookies from admin service to client (clear cookies)
			if (r.headers && r.headers['set-cookie']) {
				r.headers['set-cookie'].forEach((cookie: string) => {
					res.setHeader('Set-Cookie', cookie);
				});
			}
			
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) {
			console.error('❌ Logout error:', e);
			next(e);
		}
	};

	// Users
	createUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/users', 'POST', req.body, headers);
			res.status(HTTP_STATUS.CREATED).json(r.data);
		} catch (e) { next(e); }
	};
	listUsers = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const qs = new URLSearchParams(req.query as any).toString();
			const path = qs ? `/admin/users?${qs}` : '/admin/users';
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(path, 'GET', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	updateUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/users/${req.params.id}`, 'PUT', req.body, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/users/${req.params.id}/role`, 'PATCH', req.body, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	deleteUser = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/users/${req.params.id}`, 'DELETE', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};

	// Products
	createProduct = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/products', 'POST', req.body, headers);
			res.status(HTTP_STATUS.CREATED).json(r.data);
		} catch (e) { next(e); }
	};
	listProducts = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/products', 'GET', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	listActiveProducts = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const r = await this.proxy.forward('/admin/products/active', 'GET', undefined, {});
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	updateProduct = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/products/${req.params.id}`, 'PUT', req.body, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	toggleProduct = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/products/${req.params.id}/toggle`, 'PATCH', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward(`/admin/products/${req.params.id}`, 'DELETE', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};

	// Health check
	healthCheck = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const r = await this.proxy.forward('/health', 'GET', undefined, {});
			res.status(HTTP_STATUS.OK).json({
				...r.data,
				apiGateway: 'ok',
				timestamp: new Date().toISOString()
			});
		} catch (e) { 
			res.status(500).json({
				apiGateway: 'ok',
				adminService: 'error',
				error: (e as Error).message,
				timestamp: new Date().toISOString()
			});
		}
	};

	// Dashboard
	ordersSnapshot = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// ✅ Extract JWT from cookies and add to Authorization header
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/dashboard/orders', 'GET', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};
	metrics = async (req: Request, res: Response, next: NextFunction) => {
		try {
			// ✅ Extract JWT from cookies and add to Authorization header
			const headers = this.getAuthHeaders(req);
			const r = await this.proxy.forward('/admin/dashboard/metrics', 'GET', undefined, headers);
			res.status(HTTP_STATUS.OK).json(r.data);
		} catch (e) { next(e); }
	};

	// ✅ Helper method to extract JWT from cookies and forward all cookies
	private getAuthHeaders(req: Request): Record<string, string> {
		const headers: Record<string, string> = {};
		
		// Forward all cookies to admin service (needed for refresh token)
		if (req.headers.cookie) {
			headers.cookie = req.headers.cookie;
		}
		
		// Also add Authorization header if accessToken is available
		const token = req.cookies?.accessToken;
		if (token) {
			headers.authorization = `Bearer ${token}`;
		}
		
		return headers;
	}
}
