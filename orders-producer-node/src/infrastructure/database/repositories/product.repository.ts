import MongoSingleton from "../mongo";
import { Product } from "../../../domain/models/product";

/**
 * Repositorio para obtener productos desde MongoDB
 */
export class ProductRepository {
  private collectionName = "products";

  private async collection() {
    const db = await MongoSingleton.connect();
    return db.collection<Product>(this.collectionName);
  }

  /**
   * Obtiene todos los productos habilitados desde MongoDB
   */
  async getAllEnabled(): Promise<Product[]> {
    try {
      const col = await this.collection();
      return col
        .find({ enabled: true })
        .sort({ id: 1 }) // Ordenar por ID numérico
        .toArray();
    } catch (error) {
      console.error("❌ Error obteniendo productos desde MongoDB:", error);
      return [];
    }
  }

  /**
   * Obtiene todos los productos (habilitados y deshabilitados)
   */
  async getAll(): Promise<Product[]> {
    try {
      const col = await this.collection();
      return col
        .find({})
        .sort({ id: 1 })
        .toArray();
    } catch (error) {
      console.error("❌ Error obteniendo todos los productos desde MongoDB:", error);
      return [];
    }
  }

  /**
   * Obtiene un producto por su ID
   */
  async getById(id: string | number): Promise<Product | null> {
    try {
      const col = await this.collection();
      const query = typeof id === "number" ? { id } : { _id: id };
      return await col.findOne(query);
    } catch (error) {
      console.error("❌ Error obteniendo producto por ID:", error);
      return null;
    }
  }

  /**
   * Obtiene un producto por su nombre
   */
  async getByName(name: string): Promise<Product | null> {
    try {
      const col = await this.collection();
      return await col.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    } catch (error) {
      console.error("❌ Error obteniendo producto por nombre:", error);
      return null;
    }
  }

  /**
   * Crea o actualiza un producto
   */
  async upsert(product: Product): Promise<void> {
      console.log('🟢 [ProductRepository.upsert] Producto recibido:', JSON.stringify(product, null, 2));
      console.log('🟢 [ProductRepository.upsert] preparationTime:', product.preparationTime, 'category:', product.category);
    try {
      const col = await this.collection();
      const query = product.id ? { id: product.id } : { name: product.name };
      
      await col.updateOne(
        query,
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
    } catch (error) {
      console.error("❌ Error guardando producto:", error);
      throw error;
    }
  }

  /**
   * Elimina un producto (soft delete: deshabilita)
   */
  async disable(id: string | number): Promise<boolean> {
    try {
      const col = await this.collection();
      const query = typeof id === "number" ? { id } : { _id: id };
      const result = await col.updateOne(query, { $set: { enabled: false, updatedAt: new Date() } });
      return result.matchedCount > 0;
    } catch (error) {
      console.error("❌ Error deshabilitando producto:", error);
      return false;
    }
  }
}

