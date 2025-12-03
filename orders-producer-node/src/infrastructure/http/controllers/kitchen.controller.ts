// src/infrastructure/http/controllers/kitchen.controller.ts
import { Request, Response, NextFunction } from "express";
import { OrderRepository } from "../../../domain/interfaces/order.interface";
import { KitchenOrder } from "../../../domain/models/order";

// Repository debe ser inyectado desde index.ts (siempre MongoOrderRepository)
let repo: OrderRepository | null = null;

export function setOrderRepository(r: OrderRepository) {
  repo = r;
}

export function getRepository(): OrderRepository {
  if (!repo) {
    throw new Error("Repository no inicializado");
  }
  return repo;
}

export async function getKitchenOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!repo) {
      return res.status(500).json({ error: "Repository no inicializado" });
    }
    const payload = await repo.getAll();
    // Solo retornar pedidos en preparación para la vista de cocina
    // const preparing = payload.filter((o) => o.status === "preparing");
    return res.json(payload);
  } catch (err) {
    return next(err);
  }
}

// helpers used by worker or other internal modules — async and non-blocking
export async function addKitchenOrder(order: KitchenOrder): Promise<void> {
  if (!repo) {
    throw new Error("Repository no inicializado");
  }
  order.status = "pending"; // Estado inicial: pending (esperando que cocina lo inicie)
  await repo.create(order);
}

export async function markOrderReady(id: string): Promise<boolean> {
  if (!repo) {
    throw new Error("Repository no inicializado");
  }
  return repo.updateStatus(id, "ready");
}

export async function removeOrderFromKitchen(id: string): Promise<void> {
  if (!repo) {
    throw new Error("Repository no inicializado");
  }
  await repo.remove(id);
}

// Endpoint HTTP para actualizar estado de orden manualmente
export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!repo) {
      return res.status(500).json({ error: "Repository no inicializado" });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validar ID
    if (!id) {
      return res.status(400).json({ error: "ID de orden requerido" });
    }

    // Validar estado
    const validStatuses: KitchenOrder["status"][] = ["pending", "preparing", "ready", "completed", "cancelled"];
    if (!status || typeof status !== 'string' || !(validStatuses as string[]).includes(status)) {
      return res.status(400).json({ 
        error: "Estado inválido", 
        validStatuses 
      });
    }

    const updated = await repo.updateStatus(id, status as KitchenOrder["status"]);
    
    if (!updated) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    return res.json({ success: true, id, status });
  } catch (err) {
    return next(err);
  }
}

export async function updateOrder(req: Request, res: Response, next: NextFunction) {
  try {
    if (!repo) {
      return res.status(500).json({ error: "Repository no inicializado" });
    }

    const { id } = req.params;
    const { customerName, table, items } = req.body;

    // Validar ID
    if (!id) {
      return res.status(400).json({ error: "ID de orden requerido" });
    }

    // Get existing order
    const existingOrder = await repo.getById(id);
    if (!existingOrder) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    // Don't allow updates if order is being prepared or beyond
    if (existingOrder.status !== 'pending') {
      return res.status(409).json({ error: "No se puede editar una orden que ya está en preparación" });
    }

    // Create updated order
    const updatedOrder: KitchenOrder = {
      ...existingOrder,
      customerName: customerName || existingOrder.customerName,
      table: table || existingOrder.table,
      items: items || existingOrder.items
    };

    // Update in database (remove and create since there's no update method)
    await repo.remove(id);
    await repo.create(updatedOrder);

    return res.json({ 
      success: true, 
      data: updatedOrder,
      message: "Order updated successfully"
    });
  } catch (err) {
    return next(err);
  }
}