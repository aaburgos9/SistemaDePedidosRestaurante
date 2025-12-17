import { Response } from 'express';
import { errorHandler } from '../../src/middlewares/errorHandler';
import { MicroserviceErrorHandler } from '../../src/handlers/MicroserviceErrorHandler';
import { ConnectionRefusedErrorHandler } from '../../src/handlers/ConnectionRefusedErrorHandler';
import { TimeoutErrorHandler } from '../../src/handlers/TimeoutErrorHandler';
import { UnknownErrorHandler } from '../../src/handlers/UnknownErrorHandler';

describe('ErrorHandler Middleware - Unit Tests', () => {
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('Error routing', () => {
    it('should route to MicroserviceErrorHandler for axios errors with response', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      };

      errorHandler(axiosError, {} as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should route to ConnectionRefusedErrorHandler for ECONNREFUSED', () => {
      const connError = {
        code: 'ECONNREFUSED',
        message: 'connect ECONNREFUSED',
      };

      errorHandler(connError, {} as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Service unavailable',
            code: 503,
          }),
        })
      );
    });

    it('should route to TimeoutErrorHandler for ETIMEDOUT', () => {
      const timeoutError = {
        code: 'ETIMEDOUT',
        message: 'timeout',
      };

      errorHandler(timeoutError, {} as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(504);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Request timeout',
            code: 504,
          }),
        })
      );
    });

    it('should route to UnknownErrorHandler for unknown errors', () => {
      const unknownError = new Error('Something went wrong');

      errorHandler(unknownError, {} as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'Something went wrong',
            code: 500,
          }),
        })
      );
    });
  });

  describe('Handler priority', () => {
    it('should check handlers in order', () => {
      const specificError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };

      errorHandler(specificError, {} as any, mockRes as Response, mockNext);

      // MicroserviceErrorHandler should handle it first
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should fall through to UnknownErrorHandler when no specific handler matches', () => {
      const weirdError = { custom: 'error', type: 'unknown' };

      errorHandler(weirdError, {} as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Error response format', () => {
    it('should always return success: false', () => {
      const error = new Error('Test error');

      errorHandler(error, {} as any, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });

    it('should include error details', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 422,
          data: { message: 'Validation failed', errors: ['field1', 'field2'] },
        },
      };

      errorHandler(axiosError, {} as any, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Object),
        })
      );
    });
  });

  describe('Specific error handlers', () => {
    describe('MicroserviceErrorHandler', () => {
      it('should handle 400 errors', () => {
        const handler = new MicroserviceErrorHandler();
        const error = {
          isAxiosError: true,
          response: { status: 400, data: { message: 'Bad Request' } },
        };

        expect(handler.canHandle(error)).toBe(true);
        handler.handle(error, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(400);
      });

      it('should handle 404 errors', () => {
        const handler = new MicroserviceErrorHandler();
        const error = {
          isAxiosError: true,
          response: { status: 404, data: { message: 'Not Found' } },
        };

        expect(handler.canHandle(error)).toBe(true);
        handler.handle(error, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(404);
      });

      it('should handle 500 errors', () => {
        const handler = new MicroserviceErrorHandler();
        const error = {
          isAxiosError: true,
          response: { status: 500, data: { message: 'Internal Error' } },
        };

        expect(handler.canHandle(error)).toBe(true);
        handler.handle(error, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
      });

      it('should not handle non-axios errors', () => {
        const handler = new MicroserviceErrorHandler();
        const error = new Error('Regular error');

        expect(handler.canHandle(error)).toBe(false);
      });
    });

    describe('ConnectionRefusedErrorHandler', () => {
      it('should handle ECONNREFUSED errors', () => {
        const handler = new ConnectionRefusedErrorHandler();
        const error = { code: 'ECONNREFUSED' };

        expect(handler.canHandle(error)).toBe(true);
        handler.handle(error, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(503);
      });

      it('should not handle other error codes', () => {
        const handler = new ConnectionRefusedErrorHandler();
        const error = { code: 'ENOTFOUND' };

        expect(handler.canHandle(error)).toBe(false);
      });
    });

    describe('TimeoutErrorHandler', () => {
      it('should not handle ECONNABORTED errors (only ETIMEDOUT)', () => {
        const handler = new TimeoutErrorHandler();
        const error = { code: 'ECONNABORTED' };

        expect(handler.canHandle(error)).toBe(false);
      });

      it('should handle ETIMEDOUT errors', () => {
        const handler = new TimeoutErrorHandler();
        const error = { code: 'ETIMEDOUT' };

        expect(handler.canHandle(error)).toBe(true);
        handler.handle(error, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(504);
      });

      it('should not handle non-timeout errors', () => {
        const handler = new TimeoutErrorHandler();
        const error = { code: 'ECONNREFUSED' };

        expect(handler.canHandle(error)).toBe(false);
      });
    });

    describe('UnknownErrorHandler', () => {
      it('should handle any error', () => {
        const handler = new UnknownErrorHandler();
        const error = new Error('Any error');

        expect(handler.canHandle(error)).toBe(true);
        handler.handle(error, mockRes as Response);

        expect(mockRes.status).toHaveBeenCalledWith(500);
      });

      it('should always return true for canHandle', () => {
        const handler = new UnknownErrorHandler();

        expect(handler.canHandle({})).toBe(true);
        expect(handler.canHandle(null)).toBe(true);
        expect(handler.canHandle(undefined)).toBe(true);
        expect(handler.canHandle('string')).toBe(true);
      });
    });
  });
});
