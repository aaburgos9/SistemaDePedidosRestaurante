import MongoSingleton from "../mongo";
import { KitchenOrder } from "../../../domain/models/order";
import { OrderRepository } from "../../../domain/interfaces/order.interface";

export class MongoOrderRepository implements OrderRepository {
  private collectionName = "orders";

  private async collection() {
    const db = await MongoSingleton.connect();
    return db.collection<KitchenOrder>(this.collectionName);
  }

  async create(order: KitchenOrder): Promise<void> {
    const col = await this.collection();
    // store `id` as a field, keep 
    await col.insertOne(order);
  }

  async getAll(): Promise<KitchenOrder[]> {
    const col = await this.collection();
    return col.find({}).sort({ createdAt: -1 }).toArray();
  }

  async getById(id: string): Promise<KitchenOrder | null> {
    const col = await this.collection();
    const doc = await col.findOne({ id });
    return (doc as KitchenOrder) ?? null;
  }

  async updateStatus(id: string, status: KitchenOrder["status"]): Promise<boolean> {
    const col = await this.collection();
    const res = await col.updateOne({ id }, { $set: { status } });
    return res.matchedCount > 0;
  }

  async remove(id: string): Promise<void> {
    const col = await this.collection();
    await col.deleteOne({ id });
  }
}
