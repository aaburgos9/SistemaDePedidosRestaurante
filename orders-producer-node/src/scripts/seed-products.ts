/**
 * Script para poblar la base de datos con productos iniciales
 * 
 * Ejecutar desde máquina local (MongoDB en localhost):
 *   npx ts-node src/scripts/seed-products.ts mongodb://localhost:27017/
 * 
 * Ejecutar desde dentro de contenedor Docker (MongoDB en red Docker):
 *   npx ts-node src/scripts/seed-products.ts mongodb://mongo:27017/
 * 
 * O configurar MONGO_URI en .env
 */
import dotenv from "dotenv";
dotenv.config();

import MongoSingleton from "../infrastructure/database/mongo";
import { Product } from "../domain/models/product";

// Aceptar URI como argumento de línea de comandos
let mongoUri = process.argv[2] || process.env.MONGO_URI || process.env.MONGO_URL;

if (!mongoUri) {
  console.error("❌ Error: MONGO_URI no proporcionado");
  console.error("");
  console.error("   Uso desde máquina local:");
  console.error("     npx ts-node src/scripts/seed-products.ts mongodb://localhost:27017/orders_db");
  console.error("");
  console.error("   Uso desde contenedor Docker:");
  console.error("     npx ts-node src/scripts/seed-products.ts mongodb://mongo:27017/orders_db");
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

async function seedProducts() {
  try {
    const db = await MongoSingleton.connect();
    const collection = db.collection<Product>("products");

    const defaultProducts: Omit<Product, "_id">[] = [
      {
        id: 1,
        name: "Hamburguesa",
        price: 10500,
        description: "Hamburguesa",
        image: "/images/hamburguesa.jpg",
        enabled: true,
        preparationTime: 10,
        category: "Hamburguesas",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        name: "Papas fritas",
        price: 12000,
        description: "Papas",
        image: "/images/papas.jpg",
        enabled: true,
        preparationTime: 4,
        category: "Acompañamientos",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        name: "Perro caliente",
        price: 8000,
        description: "Perro",
        image: "/images/perro.jpg",
        enabled: true,
        preparationTime: 6,
        category: "Perros",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 4,
        name: "Refresco",
        price: 7000,
        description: "Refresco",
        image: "/images/refresco.jpg",
        enabled: true,
        preparationTime: 2,
        category: "Bebidas",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("🌱 Sembrando productos en MongoDB...");

    for (const product of defaultProducts) {
      if (!product.id) {
        console.warn(`⚠️ Producto sin ID: ${product.name}, saltando...`);
        continue;
      }

      const result = await collection.updateOne(
        { id: product.id },
        {
          $set: {
            name: product.name,
            price: product.price,
            description: product.description,
            image: product.image,
            enabled: product.enabled,
            preparationTime: product.preparationTime,
            category: product.category,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        console.log(`  ✅ Creado: ${product.name} ($${product.price.toLocaleString()})`);
      } else {
        console.log(`  🔄 Actualizado: ${product.name} ($${product.price.toLocaleString()})`);
      }
    }

    console.log("✅ Productos sembrados exitosamente");
    await MongoSingleton.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error sembrando productos:", error);
    process.exit(1);
  }
}

seedProducts();

