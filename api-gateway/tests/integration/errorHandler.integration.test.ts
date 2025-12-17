import request from 'supertest';
import express, { Express } from 'express';
import { errorHandler } from '../../src/middlewares/errorHandler';

describe('ErrorHandler Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test routes that throw different types of errors
    app.get('/axios-error', (_req, _res, next) => {
      const error: any = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Bad Request from microservice' },
        },
      };
      next(error);
    });

    app.get('/connection-error', (_req, _res, next) => {
      const error: any = {
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED 127.0.0.1:3001',
      };
      next(error);
    });

    app.get('/timeout-error', (_req, _res, next) => {
      const error: any = {
        code: 'ETIMEDOUT',
        message: 'timeout',
      };
      next(error);
    });

    app.get('/unknown-error', (_req, _res, next) => {
      next(new Error('Something unexpected happened'));
    });

    app.get('/404-error', (_req, _res, next) => {
      const error: any = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Resource not found' },
        },
      };
      next(error);
    });

    app.get('/500-error', (_req, _res, next) => {
      const error: any = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal server error in microservice' },
        },
      };
      next(error);
    });

    // Apply error handler
    app.use(errorHandler);
  });

  describe('Microservice errors', () => {
    it('should handle 400 Bad Request from microservice', async () => {
      const response = await request(app).get('/axios-error');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('Bad Request');
    });

    it('should handle 404 Not Found from microservice', async () => {
      const response = await request(app).get('/404-error');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });

    it('should handle 500 Internal Server Error from microservice', async () => {
      const response = await request(app).get('/500-error');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Connection errors', () => {
    it('should handle ECONNREFUSED with 503 status', async () => {
      const response = await request(app).get('/connection-error');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('unavailable');
    });
  });

  describe('Timeout errors', () => {
    it('should handle timeout with 504 status', async () => {
      const response = await request(app).get('/timeout-error');

      expect(response.status).toBe(504);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('timeout');
    });
  });

  describe('Unknown errors', () => {
    it('should handle unknown errors with 500 status', async () => {
      const response = await request(app).get('/unknown-error');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Something unexpected');
    });
  });

  describe('Error response structure', () => {
    it('should always return consistent error format', async () => {
      const response = await request(app).get('/unknown-error');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
    });

    it('should include original error data for microservice errors', async () => {
      const response = await request(app).get('/axios-error');

      expect(response.body.error).toHaveProperty('details');
      expect(response.body.error.details).toHaveProperty('message');
    });
  });

  describe('Multiple errors in sequence', () => {
    it('should handle multiple different errors correctly', async () => {
      const errors = [
        { endpoint: '/axios-error', expectedStatus: 400 },
        { endpoint: '/connection-error', expectedStatus: 503 },
        { endpoint: '/timeout-error', expectedStatus: 504 },
        { endpoint: '/unknown-error', expectedStatus: 500 },
      ];

      for (const { endpoint, expectedStatus } of errors) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(expectedStatus);
        expect(response.body.success).toBe(false);
      }
    });
  });
});
