import { v4 as uuidv4 } from "uuid";
import { KitchenOrder, OrderMessage } from "../../domain/models/order";

export function createKitchenOrderFromMessage(msg: OrderMessage): KitchenOrder {
  return {
    ...msg,
    id: msg.id || uuidv4(),
    createdAt: msg.createdAt || new Date().toISOString(),
    status: (msg as any).status || "pending",
  } as KitchenOrder;
}
