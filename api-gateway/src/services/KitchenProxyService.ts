import { ProxyService } from './ProxyService';
import { env } from '../config/environment';
import { SERVICES } from '../config/constants';

// Proxy para el microservicio de cocina (Node.js)
export class KitchenProxyService extends ProxyService {
  constructor() {
    super(SERVICES.NODE_MS, env.NODE_MS_URL);
  }
}