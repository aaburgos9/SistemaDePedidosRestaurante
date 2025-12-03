// src/infrastructure/http/server.ts
import express from "express";
import { setOrderRepository, getKitchenOrders, updateOrderStatus, updateOrder } from "./controllers/kitchen.controller";
import { MongoOrderRepository } from "../database/repositories/mongo.order.repository";
import mongoSingleton from "../database/mongo";
import { startWorker } from "../messaging/worker";
import "../websocket/ws-server"; // Inicia WebSocket server

export async function startServer() {
  try {
    // 1. Conectar a MongoDB
    await mongoSingleton.connect();
    console.log("✅ MongoDB conectado");

    // 2. Inicializar repositorio
    const repo = new MongoOrderRepository();
    setOrderRepository(repo);
    console.log("✅ Repositorio inicializado");

    // 3. Iniciar worker de RabbitMQ
    await startWorker();
    console.log("✅ Worker iniciado");

    // 4. Crear servidor HTTP
    const app = express();
    app.use(express.json());

    // Rutas
    app.get("/kitchen/orders", getKitchenOrders);
    app.put("/kitchen/orders/:id", updateOrder);
    app.patch("/kitchen/orders/:id", updateOrderStatus);

    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`🚀 Node MS escuchando en puerto ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    throw error;
  }
}
