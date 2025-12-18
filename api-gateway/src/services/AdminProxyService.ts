import { ProxyService } from './ProxyService';
import { env } from '../config/environment';
import { SERVICES } from '../config/constants';

export class AdminProxyService extends ProxyService {
  constructor() {
    const adminUrl = (env as any).ADMIN_MS_URL || process.env.ADMIN_MS_URL || 'https://admin-service-27263349264.northamerica-south1.run.app';
    console.log(`🔗 AdminProxyService URL: ${adminUrl}`);
    super(SERVICES.ADMIN_MS || 'ADMIN-MS', adminUrl);
  }
}
