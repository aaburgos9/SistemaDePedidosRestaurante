import { Request, Response, NextFunction } from "express";
import { CategoryRepository } from "../../database/repositories/category.repository";

const repo = new CategoryRepository();

export async function getAllCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await repo.getAll();
    return res.json({ success: true, data: categories });
  } catch (err) {
    return next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Nombre inválido' });
    }
    const created = await repo.create(name.trim());
    if (!created) {
      return res.status(409).json({ success: false, message: 'La categoría ya existe' });
    }
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    return next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido' });
    const ok = await repo.delete(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
    return res.json({ success: true, message: 'Categoría eliminada' });
  } catch (err) {
    return next(err);
  }
}
