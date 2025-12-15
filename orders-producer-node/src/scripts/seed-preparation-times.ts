/**
 * Script para poblar la base de datos con tiempos de preparación iniciales
 * 
 * Ejecutar desde máquina local (MongoDB en localhost):
 *   npx ts-node src/scripts/seed-preparation-times.ts mongodb://localhost:27017/
 * 
 * Ejecutar desde dentro de contenedor Docker (MongoDB en red Docker):
 *   npx ts-node src/scripts/seed-preparation-times.ts mongodb://mongo:27017/
 * 
 * O configurar MONGO_URI en .env
 */
import dotenv from "dotenv";
dotenv.config();

import MongoSingleton from "../infrastructure/database/mongo";
import { PreparationTime } from "../domain/models/preparation-time";

// Aceptar URI como argumento de línea de comandos
let mongoUri = process.argv[2] || process.env.MONGO_URI || process.env.MONGO_URL;

if (!mongoUri) {
  console.error("❌ Error: MONGO_URI no proporcionado");
  console.error("");
  console.error("   Uso desde máquina local:");
  console.error("     npx ts-node src/scripts/seed-preparation-times.ts mongodb://localhost:27017/orders_db");
  console.error("");
  console.error("   Uso desde contenedor Docker:");
  console.error("     npx ts-node src/scripts/seed-preparation-times.ts mongodb://mongo:27017/orders_db");
  console.error("");
  console.error("   O configura MONGO_URI en .env");
  process.exit(1);
}

// Asegurar que la URI incluya el nombre de la base de datos si no lo tiene
if (!mongoUri.includes('/') || mongoUri.endsWith('/')) {
  // Si termina en / o no tiene path, agregar orders_db
  mongoUri = mongoUri.replace(/\/$/, '') + '/orders_db';
}

// Establecer la URI y DB antes de importar MongoSingleton
process.env.MONGO_URI = mongoUri;
process.env.MONGO_DB = process.env.MONGO_DB || "orders_db";

async function seedPreparationTimes() {
  try {
    const db = await MongoSingleton.connect();
    const collection = db.collection<PreparationTime>("preparation_times");

    const defaultTimes: Omit<PreparationTime, "_id">[] = [
      {
        productName: "Hamburguesa",
        secondsPerUnit: 10,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productName: "Papas fritas",
        secondsPerUnit: 4,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productName: "Perro caliente",
        secondsPerUnit: 6,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        productName: "Refresco",
        secondsPerUnit: 2,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("🌱 Sembrando tiempos de preparación en MongoDB...");

    for (const time of defaultTimes) {
      const result = await collection.updateOne(
        { productName: time.productName },
        {
          $set: {
            secondsPerUnit: time.secondsPerUnit,
            enabled: time.enabled,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`  ✅ Creado: ${time.productName} (${time.secondsPerUnit}s)`);
      } else {
        console.log(`  🔄 Actualizado: ${time.productName} (${time.secondsPerUnit}s)`);
      }
    }

    console.log("✅ Tiempos de preparación sembrados exitosamente");
    await MongoSingleton.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error sembrando tiempos de preparación:", error);
    process.exit(1);
  }
}

seedPreparationTimes();

