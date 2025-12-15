import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IProxyService } from '../interfaces/IProxyService';
import { env } from '../config/environment';
import { retryWithBackoff } from '../utils/retryLogic';

// Clase base para servicios proxy con lógica de reintento
export abstract class ProxyService implements IProxyService {
  protected axiosInstance: AxiosInstance;
  protected serviceName: string;
  protected baseURL: string;

  constructor(serviceName: string, baseURL: string) {
    this.serviceName = serviceName;
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      timeout: env.REQUEST_TIMEOUT,
    });
  }

  // Redirige peticiones al microservicio con headers de rastreo
  async forward(
    path: string,
    method: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<AxiosResponse> {
    const requestConfig = {
      method: method.toUpperCase(),
      url: path,
      data,
      headers: {
        ...headers,
        'X-Forwarded-For': 'api-gateway',
      },
    };

    console.log(`📤 Proxy request [${this.serviceName}]:`, { 
      path, 
      method: method.toUpperCase(),
      url: `${this.baseURL}${path}`,
      hasAuth: !!headers?.authorization 
    });

    try {
      const response = await retryWithBackoff(() => this.axiosInstance.request(requestConfig));
      console.log(`✅ Proxy response [${this.serviceName}]:`, { 
        status: response.status,
        statusText: response.statusText
      });
      return response;
    } catch (error: any) {
      console.error(`❌ Proxy error [${this.serviceName}]:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  getServiceName(): string {
    return this.serviceName;
  }

  getBaseURL(): string {
    return this.baseURL;
  }


}