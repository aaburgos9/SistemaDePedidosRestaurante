import request from 'supertest';
import express from 'express';
import { corsConfig } from '../../src/middlewares/cors';
import { requestLogger } from '../../src/middlewares/logger';
import { errorHandler } from '../../src/middlewares/errorHandler';

describe('Health Check Integration', () => {
  let app: any;
  let mockOrdersForward: jest.Mock;
  let mockKitchenForward: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    mockOrdersForward = jest.fn();
    mockKitchenForward = jest.fn();

    // ✅ Mock Orders
    jest.doMock('../../src/services/OrdersProxyService', () => ({
      OrdersProxyService: jest.fn().mockImplementation(() => ({
        forward: mockOrdersForward,
        getServiceName: jest.fn().mockReturnValue('python-ms'),
        getBaseURL: jest.fn().mockReturnValue('http://localhost:8000'),
      })),
    }));

    // ✅ Mock Kitchen
    jest.doMock('../../src/services/KitchenProxyService', () => ({
      KitchenProxyService: jest.fn().mockImplementation(() => ({
        forward: mockKitchenForward,
        getServiceName: jest.fn().mockReturnValue('node-ms'),
        getBaseURL: jest.fn().mockReturnValue('http://localhost:3002'),
      })),
    }));

    // ✅ Importar DESPUÉS
    const ordersRoutes = require('../../src/routes/orders.routes').default;
    const kitchenRoutes = require('../../src/routes/kitchen.routes').default;

    app = express();
    app.use(corsConfig);
    app.use(express.json());
    app.use(requestLogger);
    app.use('/api/orders', ordersRoutes);
    app.use('/api/kitchen', kitchenRoutes);
    app.use(errorHandler);
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Application Bootstrap', () => {
    it('debe crear la aplicación correctamente', () => {
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
    });

    it('debe tener las rutas de orders configuradas', async () => {
      mockOrdersForward.mockResolvedValue({ 
        data: { id: '1' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await request(app)
        .get('/api/orders/1')
        .expect(200);

      expect(mockOrdersForward).toHaveBeenCalled();
    });

    it('debe tener las rutas de kitchen configuradas', async () => {
      mockKitchenForward.mockResolvedValue({ 
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await request(app)
        .get('/api/kitchen/orders')
        .expect(200);

      expect(mockKitchenForward).toHaveBeenCalled();
    });
  });

  describe('Middleware Configuration', () => {
    it('debe parsear JSON correctamente', async () => {
      mockOrdersForward.mockResolvedValue({ 
        data: { id: '1' },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      });

      const testData = { customerName: 'Test', table: 1, items: [] };

      await request(app)
        .post('/api/orders')
        .send(testData)
        .set('Content-Type', 'application/json')
        .expect(201);

      expect(mockOrdersForward).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        testData,
        expect.any(Object)
      );
    });

    it('debe manejar errores correctamente con el middleware de errores', async () => {
      mockOrdersForward.mockRejectedValue(new Error('Test error'));

      const response = await request(app)
        .post('/api/orders')
        .send({ test: 'data' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('debe retornar 404 para rutas no encontradas', async () => {
      const response = await request(app)
        .get('/api/nonexistent-route')
        .expect(404);

      expect(response.status).toBe(404);
    });

    it('debe incluir timestamp en las respuestas de error', async () => {
      mockOrdersForward.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/orders')
        .send({ test: 'data' });

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
});