import { Request, Response, NextFunction } from 'express';
import { KitchenProxyService } from '../services/KitchenProxyService';
import { formatSuccessResponse } from '../utils/responseFormatter';
import { HTTP_STATUS } from '../config/constants';

// Controlador para operaciones de cocina
export class KitchenController {
  private proxyService: KitchenProxyService;

  constructor(proxyService: KitchenProxyService) {
    this.proxyService = proxyService;
  }

  getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const qs = new URLSearchParams(req.query as Record<string, string>).toString();
      const path = qs ? `/kitchen/orders?${qs}` : '/kitchen/orders';
      const response = await this.proxyService.forward(path, 'GET');
      
      res.status(HTTP_STATUS.OK).json(
        formatSuccessResponse(response.data)
      );
    } catch (error: any) {
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const response = await this.proxyService.forward(
        `/kitchen/orders/${id}`,
        'PATCH',
        req.body
      );
      
      res.status(HTTP_STATUS.OK).json(
        formatSuccessResponse(response.data, 'Order status updated')
      );
    } catch (error: any) {
      next(error);
    }
  };

  updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const response = await this.proxyService.forward(`/kitchen/orders/${id}`, 'PUT', req.body, req.headers as Record<string, string>);
      
      res.status(HTTP_STATUS.OK).json(
        formatSuccessResponse(response.data, 'Order updated successfully')
      );
    } catch (error: any) {
      next(error);
    }
  };
}