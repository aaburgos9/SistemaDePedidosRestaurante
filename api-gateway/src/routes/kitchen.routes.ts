import { Router } from 'express';
import { KitchenController } from '../controllers/KitchenController';
import { KitchenProxyService } from '../services/KitchenProxyService';

const router = Router();
const proxyService = new KitchenProxyService();
const controller = new KitchenController(proxyService);

// Rutas para gestión de cocina
router.get('/orders', controller.getOrders);
router.patch('/orders/:id', controller.updateOrderStatus);
router.get('/products', controller.getProducts);

export default router;