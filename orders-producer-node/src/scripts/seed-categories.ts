/**
 * Script para poblar la base de datos con categorías iniciales
 * 
 * Ejecutar desde máquina local (MongoDB en localhost):
 *   npx ts-node src/scripts/seed-categories.ts mongodb://localhost:27017/
 * 
 * Ejecutar desde dentro de contenedor Docker (MongoDB en red Docker):
 *   npx ts-node src/scripts/seed-categories.ts mongodb://mongo:27017/
 * 
 * O configurar MONGO_URI en .env
 */
import dotenv from "dotenv";
dotenv.config();

import MongoSingleton from "../infrastructure/database/mongo";

let mongoUri = process.argv[2] || process.env.MONGO_URI || process.env.MONGO_URL;

if (!mongoUri) {
  console.error("❌ Error: MONGO_URI no proporcionado");
  process.exit(1);
}

if (!mongoUri.includes('/') || mongoUri.endsWith('/')) {
  mongoUri = mongoUri.replace(/\/$/, '') + '/orders_db';
}

process.env.MONGO_URI = mongoUri;
process.env.MONGO_DB = process.env.MONGO_DB || "orders_db";

async function seedCategories() {
  try {
    const db = await MongoSingleton.connect();
    const collection = db.collection("categories");

    const defaultCategories = [
      "Hamburguesas",
      "Perros Calientes",
      "Pizzas",
      "Papas y Acompañamientos",
      "Combos",
      "Bebidas",
      "Postres"
    ];

    console.log("🌱 Sembrando categorías en MongoDB...");

    for (const name of defaultCategories) {
      const exists = await collection.findOne({ name });
      if (exists) {
        console.log(`  🔄 Ya existe: ${name}`);
        continue;
      }
      const result = await collection.insertOne({ name, createdAt: new Date() });
      console.log(`  ✅ Creada: ${name} (${result.insertedId})`);
    }

    console.log("✅ Categorías sembradas exitosamente");
    await MongoSingleton.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error sembrando categorías:", error);
    process.exit(1);
  }
}

seedCategories();
