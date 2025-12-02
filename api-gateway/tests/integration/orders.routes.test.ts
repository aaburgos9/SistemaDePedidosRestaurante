import request from 'supertest';
import express from 'express';
import { corsConfig } from '../../src/middlewares/cors';
import { requestLogger } from '../../src/middlewares/logger';
import { errorHandler } from '../../src/middlewares/errorHandler';

describe('Orders Routes Integration', () => {
  let app: any;
  let mockForward: jest.Mock;
  let ordersRoutes: any;
  let OrdersProxyService: any;

  beforeEach(() => {
    // ✅ Limpiar todos los módulos
    jest.resetModules();
    jest.clearAllMocks();

    // ✅ Configurar mock ANTES de importar
    mockForward = jest.fn();

    // ✅ Mock con jest.doMock
    jest.doMock('../../src/services/OrdersProxyService', () => {
      return {
        OrdersProxyService: jest.fn().mockImplementation(() => ({
          forward: mockForward,
          getServiceName: jest.fn().mockReturnValue('python-ms'),
          getBaseURL: jest.fn().mockReturnValue('http://localhost:8000'),
        })),
      };
    });

    // ✅ AHORA sí importar (require, no import)
    ordersRoutes = require('../../src/routes/orders.routes').default;

    // ✅ Crear app
    app = express();
    app.use(corsConfig);
    app.use(express.json());
    app.use(requestLogger);
    app.use('/api/orders', ordersRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('POST /api/orders', () => {
    it('debe crear un pedido exitosamente', async () => {
      // Arrange
      const newOrder = {
        customerName: 'Juan Pérez',
        table: 5,
        items: [
          { productId: 'burger-1', quantity: 2, notes: 'Sin cebolla' },
        ],
      };

      const mockResponse = {
        data: {
          id: '123',
          ...newOrder,
          createdAt: new Date().toISOString(),
        },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };

      mockForward.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');
      expect(response.body.data).toEqual(mockResponse.data);
      expect(mockForward).toHaveBeenCalledWith(
        '/api/v1/orders/',
        'POST',
        newOrder,
        expect.any(Object)
      );
    });

    it('debe retornar 400 cuando el proxy falla con bad request', async () => {
      // Arrange
      const invalidOrder = { customerName: '' };
      
      const axiosError: any = new Error('Validation error');
      axiosError.response = {
        status: 400,
        statusText: 'Bad Request',
        data: { message: 'Invalid order data' },
        headers: {},
        config: {} as any,
      };

      mockForward.mockRejectedValue(axiosError);

      // Act
      const response = await request(app)
        .post('/api/orders')
        .send(invalidOrder)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toBe('Invalid order data');
    });

    it('debe retornar 503 cuando el servicio no está disponible', async () => {
      // Arrange
      const order = { customerName: 'Test', table: 1, items: [] };
      
      const connectionError: any = new Error('connect ECONNREFUSED');
      connectionError.code = 'ECONNREFUSED';

      mockForward.mockRejectedValue(connectionError);

      // Act
      const response = await request(app)
        .post('/api/orders')
        .send(order)
        .expect(503);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Service unavailable');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('debe obtener un pedido por ID', async () => {
      // Arrange
      const orderId = '123';
      
      const mockResponse = {
        data: {
          id: orderId,
          customerName: 'María García',
          table: 3,
          items: [],
          status: 'pending',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockForward.mockResolvedValue(mockResponse);

      // Act
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(mockForward).toHaveBeenCalledWith(
        `/api/v1/orders/${orderId}`,
        'GET'
      );
    });

    it('debe retornar 404 cuando el pedido no existe', async () => {
      // Arrange
      const orderId = '999';
      
      const notFoundError: any = new Error('Not found');
      notFoundError.response = {
        status: 404,
        statusText: 'Not Found',
        data: { message: 'Order not found' },
        headers: {},
        config: {} as any,
      };

      mockForward.mockRejectedValue(notFoundError);

      // Act
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(404);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Order not found');
    });
  });

  describe('CORS y Headers', () => {
    it('debe permitir peticiones CORS', async () => {
      // Arrange
      mockForward.mockResolvedValue({
        data: {},
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      // Act
      const response = await request(app)
        .post('/api/orders')
        .set('Origin', 'http://localhost:5173')
        .send({ customerName: 'Test', table: 1, items: [] });

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});