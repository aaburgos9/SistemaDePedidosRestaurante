import { Request, Response, NextFunction } from 'express';
import { OrdersProxyService } from '../services/OrdersProxyService';
import { formatSuccessResponse, formatErrorResponse } from '../utils/responseFormatter';
import { HTTP_STATUS } from '../config/constants';

// Controlador para operaciones de pedidos
export class OrdersController {
  private proxyService: OrdersProxyService;

  constructor(proxyService: OrdersProxyService) {
    this.proxyService = proxyService;
  }

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('📝 Creating order through API Gateway');
      console.log('🔗 Python service URL:', this.proxyService.getBaseURL());
      console.log('📦 Order data:', JSON.stringify(req.body, null, 2));
      
      const response = await this.proxyService.forward('/api/v1/orders/', 'POST', req.body, req.headers as Record<string, string>);
      
      console.log('✅ Order created successfully:', response.data);
      res.status(HTTP_STATUS.CREATED).json(
        formatSuccessResponse(response.data, 'Order created successfully')
      );
    } catch (error: any) {
      console.error('❌ Error creating order:', error.message);
      console.error('❌ Error details:', error.response?.data || error);
      next(error);
    }
  };

  getOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const response = await this.proxyService.forward(`/api/v1/orders/${id}`, 'GET');
      
      res.status(HTTP_STATUS.OK).json(
        formatSuccessResponse(response.data)
      );
    } catch (error: any) {
      next(error);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const response = await this.proxyService.forward(`/api/v1/orders/${id}`, 'PUT', req.body, req.headers as Record<string, string>);
      
      res.status(HTTP_STATUS.OK).json(
        formatSuccessResponse(response.data, 'Order updated successfully')
      );
    } catch (error: any) {
      next(error);
    }
  };

  // Health check for Python service
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try to connect to Python service
      const response = await this.proxyService.forward('/docs', 'GET');
      res.status(HTTP_STATUS.OK).json({
        service: 'orders',
        pythonService: 'ok',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        service: 'orders',
        pythonService: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}