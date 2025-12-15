import dotenv from "dotenv";
dotenv.config();

import MongoSingleton from "../infrastructure/database/mongo";

async function listProducts() {
  try {
    const db = await MongoSingleton.connect();
    const collection = db.collection("products");
    const products = await collection.find({}).toArray();
    if (products.length === 0) {
      console.log("❌ No hay productos en la colección.");
    } else {
      console.log("📦 Productos en la colección:");
      for (const p of products) {
        console.log(`- id: ${p.id}, name: ${p.name}, price: ${p.price}`);
      }
    }
    await MongoSingleton.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error listando productos:", error);
    process.exit(1);
  }
}

listProducts();
