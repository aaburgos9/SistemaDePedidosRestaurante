// src/interfaces/order.repository.interface.ts
import { KitchenOrder } from "../models/order";

/**
 * Interface para el repositorio de órdenes
 * Define el contrato que deben implementar todos los repositorios de órdenes
 */
export interface OrderRepository {
  create(order: KitchenOrder): Promise<void>;
  getAll(): Promise<KitchenOrder[]>;
  getById(id: string): Promise<KitchenOrder | null>;
  updateStatus(id: string, status: KitchenOrder['status']): Promise<boolean>;
  remove(id: string): Promise<void>;
}

