import { ProxyService } from './ProxyService';
import { env } from '../config/environment';
import { SERVICES } from '../config/constants';

// Proxy para el microservicio de pedidos (Python)
// Redirige peticiones al servicio Python que maneja creación y gestión de pedidos
export class OrdersProxyService extends ProxyService {
  constructor() {
    super(SERVICES.PYTHON_MS, env.PYTHON_MS_URL);
    console.log(`🔗 OrdersProxyService initialized with URL: ${env.PYTHON_MS_URL}`);
  }
}