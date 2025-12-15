import MongoSingleton from "../mongo";
import { ObjectId } from "mongodb";

export interface Category {
  _id?: string | ObjectId;
  name: string;
  createdAt?: Date;
}

export class CategoryRepository {
  private collectionName = "categories";

  private async collection() {
    const db = await MongoSingleton.connect();
    return db.collection<Category>(this.collectionName);
  }

  async getAll(): Promise<Category[]> {
    try {
      const col = await this.collection();
      return col.find({}).sort({ name: 1 }).toArray();
    } catch (error) {
      console.error("❌ Error obteniendo categorías:", error);
      return [];
    }
  }

  async getById(id: string): Promise<Category | null> {
    try {
      const col = await this.collection();
      return await col.findOne({ _id: new ObjectId(id) } as any);
    } catch (error) {
      console.error("❌ Error obteniendo categoría por ID:", error);
      return null;
    }
  }

  async getByName(name: string): Promise<Category | null> {
    try {
      const col = await this.collection();
      return await col.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    } catch (error) {
      console.error("❌ Error obteniendo categoría por nombre:", error);
      return null;
    }
  }

  async create(name: string): Promise<Category | null> {
    try {
      const col = await this.collection();
      const exists = await col.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
      if (exists) return null;
      const doc = { name, createdAt: new Date() };
      const result = await col.insertOne(doc);
      return { ...doc, _id: result.insertedId.toString() };
    } catch (error) {
      console.error("❌ Error creando categoría:", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const col = await this.collection();
      const result = await col.deleteOne({ _id: new ObjectId(id) } as any);
      return result.deletedCount > 0;
    } catch (error) {
      console.error("❌ Error eliminando categoría:", error);
      return false;
    }
  }
}
