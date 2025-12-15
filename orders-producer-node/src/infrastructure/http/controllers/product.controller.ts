/**
 * POST /api/products
 * Crea o actualiza un producto (incluye preparationTime)
 */
export async function upsertProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body;
    // Validar campos mínimos
    if (!data.name || typeof data.price !== 'number' || typeof data.preparationTime !== 'number') {
      return res.status(400).json({ error: 'Faltan campos obligatorios: name, price, preparationTime' });
    }
    // Construir objeto Product
    const product: Product = {
      id: data.id,
      name: data.name,
      price: data.price,
      description: data.description || '',
      image: data.image || '',
      enabled: typeof data.enabled === 'boolean' ? data.enabled : true,
      preparationTime: data.preparationTime,
      category: data.category || '',
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: new Date(),
      _id: data._id || undefined
    };
    await repo.upsert(product);
    return res.status(200).json({ success: true, product });
  } catch (err) {
    return next(err);
  }
}
// src/infrastructure/http/controllers/product.controller.ts
import { Request, Response, NextFunction } from "express";
import { ProductRepository } from "../../database/repositories/product.repository";
import { Product } from "../../../domain/models/product";

// Repository instance (puede ser inyectado para testing)
let repo: ProductRepository = new ProductRepository();

export function setProductRepository(r: ProductRepository) {
  repo = r;
}

/**
 * GET /api/products
 * Obtiene todos los productos habilitados
 */
export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await repo.getAllEnabled();
    return res.json(products);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/products/all
 * Obtiene todos los productos (incluyendo deshabilitados) - para administración
 */
export async function getAllProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await repo.getAll();
    return res.json(products);
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/products/:id
 * Obtiene un producto por ID
 */
export async function getProductById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "ID de producto requerido" });
    }
    
    // Intentar convertir a número si es posible, sino usar como string
    const productId = /^\d+$/.test(id) ? parseInt(id, 10) : id;
    const product = await repo.getById(productId);
    
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    
    return res.json(product);
  } catch (err) {
    return next(err);
  }
}

