// src/infrastructure/http/server.ts
import express from "express";
import cors from "cors";
import { createServer } from "http";

import { setOrderRepository, getKitchenOrders, updateOrderStatus, updateOrder } from "./controllers/kitchen.controller";
import { MongoOrderRepository } from "../database/repositories/mongo.order.repository";
import mongoSingleton from "../database/mongo";
import { startWorker } from "../messaging/worker";
import { initializeWebSocket } from "../websocket/ws-server"; // Cambiar import
import { categoryRouter } from "./routes/category.routes";

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
    app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));


    // Rutas
    app.get("/kitchen/orders", getKitchenOrders);
    app.put("/kitchen/orders/:id", updateOrder);
    app.patch("/kitchen/orders/:id", updateOrderStatus);

    // Rutas de categorías
    app.use("/categories", categoryRouter);

    const PORT = process.env.PORT || 8080;
    
    // Crear servidor HTTP
    const server = createServer(app);
    
    // Inicializar WebSocket en el mismo servidor
    initializeWebSocket(server);
    
    server.listen(PORT, () => {
      console.log(`🚀 Node MS escuchando en puerto ${PORT}`);
      console.log(`🔌 WebSocket disponible en puerto ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Error iniciando servidor:", error);
    throw error;
  }
}
