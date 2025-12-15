import { ProxyService } from './ProxyService';
import { env } from '../config/environment';
import { SERVICES } from '../config/constants';

// Proxy para el microservicio de pedidos (Python)
export class OrdersProxyService extends ProxyService {
  constructor() {
    super(SERVICES.PYTHON_MS, env.PYTHON_MS_URL);
  }
}