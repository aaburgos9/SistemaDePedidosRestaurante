import { Router } from "express";
import { getAllCategories, createCategory, deleteCategory } from "../controllers/category.controller";

export const categoryRouter = Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.post("/", createCategory);
categoryRouter.delete("/:id", deleteCategory);
