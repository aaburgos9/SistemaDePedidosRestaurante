import { ProxyService } from './ProxyService';
import { env } from '../config/environment';
import { SERVICES } from '../config/constants';

export class AdminProxyService extends ProxyService {
  constructor() {
    const adminUrl = (env as any).ADMIN_MS_URL || process.env.ADMIN_MS_URL || 'http://admin-service:4001';
    console.log(`🔗 AdminProxyService URL: ${adminUrl}`);
    super(SERVICES.ADMIN_MS || 'ADMIN-MS', adminUrl);
  }
}
