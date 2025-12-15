import {  AxiosResponse } from 'axios';


/**
 * Define el contrato que DEBE cumplir cualquier servicio proxy.
 * Esto permite cambiar la implementación sin afectar el resto del código.
 */

// Interfaz para servicios proxy que redirigen peticiones a microservicios
export interface IProxyService {    
  forward(path: string, method: string, data?: any, headers?: Record<string, string>): Promise<AxiosResponse>;
  
  //Obtiene el nombre del servicio (para logging y debugging)
  getServiceName(): string;
  
  //Obtiene la URL base del microservicio
  getBaseURL(): string;
}