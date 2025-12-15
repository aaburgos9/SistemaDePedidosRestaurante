import MongoSingleton from "../mongo";
import { PreparationTime } from "../../../domain/models/preparation-time";

/**
 * Repositorio para obtener tiempos de preparación desde MongoDB
 */
export class PreparationTimeRepository {
  private collectionName = "preparation_times";

  private async collection() {
    const db = await MongoSingleton.connect();
    return db.collection<PreparationTime>(this.collectionName);
  }

  /**
   * Obtiene todos los tiempos de preparación habilitados desde MongoDB
   */
  async getAllEnabled(): Promise<PreparationTime[]> {
    try {
      const col = await this.collection();
      return col
        .find({ enabled: true })
        .sort({ productName: 1 })
        .toArray();
    } catch (error) {
      console.error("❌ Error obteniendo tiempos de preparación desde MongoDB:", error);
      return [];
    }
  }

  /**
   * Obtiene un tiempo de preparación por su ID
   */
  async getById(id: string): Promise<PreparationTime | null> {
    try {
      const col = await this.collection();
      return await col.findOne({ _id: id });
    } catch (error) {
      console.error("❌ Error obteniendo tiempo de preparación por ID:", error);
      return null;
    }
  }

  /**
   * Crea o actualiza un tiempo de preparación
   */
  async upsert(preparationTime: PreparationTime): Promise<void> {
    try {
      const col = await this.collection();
      await col.updateOne(
        { productName: preparationTime.productName },
        {
          $set: {
            ...preparationTime,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    } catch (error) {
      console.error("❌ Error guardando tiempo de preparación:", error);
      throw error;
    }
  }
}

