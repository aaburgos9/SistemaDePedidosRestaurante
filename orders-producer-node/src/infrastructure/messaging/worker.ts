// src/infrastructure/messaging/worker.ts
import { notifyClients } from "../websocket/ws-server";
import { OrderMessage } from "../../domain/models/order";
import { PreparationTimeCalculator } from "../../domain/strategies";
import { createCalculatorFromMongo } from "../../application/config/preparation.config";
import { createKitchenOrderFromMessage } from "../../application/factories/order.factory";
import { getChannel, sendToDLQ } from "./amqp.connection";
import {
  addKitchenOrder,
  markOrderReady,
} from "../http/controllers/kitchen.controller";


export let calculator: PreparationTimeCalculator | null = null;
export async function startWorker() {
  try {
    // Inicializar calculador de tiempos desde MongoDB
    if (!calculator) {
      calculator = await createCalculatorFromMongo();
      console.log("✅ Calculador de tiempos de preparación inicializado");
    }

    const channel = await getChannel();
    const queue = "orders.new";

    await channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);

    console.log("📥 Worker de cocina escuchando pedidos...");

    channel.consume(
      queue,
      async (msg: any) => {
        if (!msg) return;
        let correlationId: string | undefined;
        try {
          const pedido: OrderMessage = JSON.parse(msg.content.toString());
          correlationId = (msg.properties && (msg.properties.correlationId || msg.properties.headers?.['x-correlation-id'])) || undefined;
          console.log("🍽️ Pedido recibido en cocina:", pedido);

          // agregar pedido a la lista de cocina
          // normalize and ensure id/createdAt/status via factory
          const kitchenOrder = createKitchenOrderFromMessage(pedido);
          await addKitchenOrder(kitchenOrder);

          // notificar al frontend que hay un pedido nuevo
          notifyClients({ type: "ORDER_NEW", order: pedido });

          // calcular el tiempo total de preparación
          if (!calculator) {
            throw new Error("Calculador de tiempos no inicializado");
          }
          
          let totalSegundos = 0;
          for (const item of pedido.items) {
            totalSegundos += calculator.calculate(item.productName, item.quantity);
          }

          console.log(`⏱️ Tiempo estimado: ${totalSegundos}s`);
          console.log("👨‍🍳 Preparando pedido...");

          // NOTE: This simulates asynchronous work and does not block the event loop
          await new Promise((resolve) => setTimeout(resolve, Math.max(0, totalSegundos) * 1000));

          // marcar pedido como listo
          await markOrderReady(pedido.id);

          console.log(`✅ Pedido listo → id: ${pedido.id} | mesa: ${pedido.table} correlationId=${correlationId ?? '-'} `);

          // notificar al frontend que terminó
          notifyClients({
            type: "ORDER_READY",
            id: pedido.id,
            table: pedido.table,
            finishedAt: new Date().toISOString(),
          });

           // mantener pedido persistido en Mongo; el front debe ocultar 'ready'

          channel.ack(msg);

          // verificar si quedan pedidos en la cola
          const q = await channel.checkQueue(queue);
          if (q.messageCount === 0) {
            notifyClients({
              type: "QUEUE_EMPTY",
              message: "🕒 Esperando nuevos pedidos..."
            });
            console.log("🕒 Esperando nuevos pedidos...");
          }

        } catch (err) {
          // Mejor manejo: log estructurado, enviar a DLQ y nack sin requeue
          try {
            console.error("⚠️ Error procesando mensaje (will DLQ):", err);
            // Try to forward to DLQ to preserve payload for later analysis
            // attach correlationId to DLQ payload when present
            let payload = msg.content;
            if (correlationId) {
              try {
                const obj = JSON.parse(msg.content.toString());
                obj._dlq = obj._dlq || {};
                obj._dlq.correlationId = correlationId;
                payload = Buffer.from(JSON.stringify(obj));
              } catch (e) {
                // fallback: leave original payload
              }
            }
            await sendToDLQ(channel, "orders.failed", payload);
          } catch (dlqErr) {
            console.error("⚠️ Error enviando a DLQ:", dlqErr);
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
