// src/infrastructure/messaging/worker.ts
import { notifyClients } from "../websocket/ws-server";
import { OrderMessage } from "../../domain/models/order";
import { createKitchenOrderFromMessage } from "../../application/factories/order.factory";
import { getChannel, sendToDLQ } from "./amqp.connection";
import {
  addKitchenOrder,
} from "../http/controllers/kitchen.controller";


export async function startWorker() {
  try {
    const channel = await getChannel();
    const queue = "orders.new";

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    console.log("📥 Worker de cocina escuchando pedidos nuevos (orders.new)...");

    channel.consume(
      queue,
      async (msg: any) => {
        if (!msg) return;
        let correlationId: string | undefined;
        try {
          const pedido: OrderMessage = JSON.parse(msg.content.toString());
          correlationId = (msg.properties && (msg.properties.correlationId || msg.properties.headers?.['x-correlation-id'])) || undefined;
          
          console.log("🍽️ Nuevo pedido recibido:", pedido.id);

          // Crear pedido en MongoDB con estado "pending" (esperando que cocina lo inicie)
          const kitchenOrder = createKitchenOrderFromMessage(pedido);
          await addKitchenOrder(kitchenOrder);

          // Notificar al frontend que hay un nuevo pedido
          notifyClients({ type: "ORDER_NEW", order: pedido });

          console.log(`✅ Pedido ${pedido.id} agregado a cocina con estado: pending`);

          channel.ack(msg);

          // Verificar si quedan pedidos en la cola
          const queueInfo = await channel.checkQueue(queue);
          if (queueInfo.messageCount === 0) {
            notifyClients({
              type: "QUEUE_EMPTY",
              message: "🕒 Esperando nuevos pedidos..."
            });
            console.log("🕒 Esperando nuevos pedidos...");
          }

        } catch (err) {
          // Manejo de errores: enviar a DLQ y nack sin requeue
          try {
            console.error("⚠️ Error procesando pedido (will DLQ):", err);
            
            let payload = msg.content;
            if (correlationId) {
              try {
                const obj = JSON.parse(msg.content.toString());
                obj._dlq = obj._dlq || {};
                obj._dlq.correlationId = correlationId;
                payload = Buffer.from(JSON.stringify(obj));
              } catch (error_) {
                // fallback: mantener payload original
                console.error("⚠️ Error agregando correlationId a DLQ:", error_);
              }
            }
            await sendToDLQ(channel, "orders.failed", payload);
          } catch (error_) {
            console.error("⚠️ Error enviando a DLQ:", error_);
          } finally {
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ Error en el worker:", err);
  }
}
