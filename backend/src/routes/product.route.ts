import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from "../controllers/product.controller";

export const productRouter = Router();

productRouter.get("/", listProducts);
productRouter.get("/:id", getProductById);
productRouter.post("/", authMiddleware, requireRole("admin"), createProduct);
productRouter.put("/:id", authMiddleware, requireRole("admin"), updateProduct);
productRouter.delete("/:id", authMiddleware, requireRole("admin"), deleteProduct);
