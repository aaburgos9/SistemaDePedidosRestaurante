import { Request, Response, NextFunction } from 'express';
import { OrdersController } from '../../src/controllers/OrdersController';
import { OrdersProxyService } from '../../src/services/OrdersProxyService';

jest.mock('../../src/services/OrdersProxyService');

describe('OrdersController - Unit Tests', () => {
  let controller: OrdersController;
  let mockProxyService: jest.Mocked<OrdersProxyService>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockProxyService = new OrdersProxyService() as jest.Mocked<OrdersProxyService>;
    controller = new OrdersController(mockProxyService);

    mockReq = {
      body: {},
      params: {},
      headers: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('createOrder', () => {
    it('should create order and return 201 status', async () => {
      const orderData = {
        items: [{ productId: 1, quantity: 2 }],
        tableNumber: 5,
      };

      mockReq.body = orderData;
      mockProxyService.forward = jest.fn().mockResolvedValue({
        data: { orderId: '123', status: 'pending' },
        status: 201,
      });

      await controller.createOrder(mockReq as Request, mockRes as Response, mockNext);

      expect(mockProxyService.forward).toHaveBeenCalledWith(
        '/api/v1/orders/',
        'POST',
        orderData,
        mockReq.headers
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Order created successfully',
        })
      );
    });

    it('should call next with error when proxy fails', async () => {
      const error = new Error('Service unavailable');
      mockProxyService.forward = jest.fn().mockRejectedValue(error);

      await controller.createOrder(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });

  describe('getOrder', () => {
    it('should get order by id and return 200 status', async () => {
      mockReq.params = { id: '123' };
      const orderData = {
        orderId: '123',
        items: [],
        status: 'pending',
      };

      mockProxyService.forward = jest.fn().mockResolvedValue({
        data: orderData,
        status: 200,
      });

      await controller.getOrder(mockReq as Request, mockRes as Response, mockNext);

      expect(mockProxyService.forward).toHaveBeenCalledWith(
        '/api/v1/orders/123',
        'GET'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: orderData,
        })
      );
    });

    it('should call next with error when order not found', async () => {
      mockReq.params = { id: '999' };
      const error = { response: { status: 404 } };
      mockProxyService.forward = jest.fn().mockRejectedValue(error);

      await controller.getOrder(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateOrder', () => {
    it('should update order and return 200 status', async () => {
      mockReq.params = { id: '123' };
      mockReq.body = { status: 'preparing' };

      mockProxyService.forward = jest.fn().mockResolvedValue({
        data: { orderId: '123', status: 'preparing' },
        status: 200,
      });

      await controller.updateOrder(mockReq as Request, mockRes as Response, mockNext);

      expect(mockProxyService.forward).toHaveBeenCalledWith(
        '/api/v1/orders/123',
        'PUT',
        mockReq.body,
        mockReq.headers
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Order updated successfully',
        })
      );
    });

    it('should call next with error when update fails', async () => {
      mockReq.params = { id: '123' };
      const error = new Error('Update failed');
      mockProxyService.forward = jest.fn().mockRejectedValue(error);

      await controller.updateOrder(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
