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
      const response = await this.proxyService.forward('/api/v1/orders/', 'POST', req.body, req.headers as Record<string, string>);
      
      res.status(HTTP_STATUS.CREATED).json(
        formatSuccessResponse(response.data, 'Order created successfully')
      );
    } catch (error: any) {
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
}