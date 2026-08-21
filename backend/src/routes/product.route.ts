import { Router } from "express";
import { getProductById, listProducts } from "../controllers/product.controller";

export const productRouter = Router();

productRouter.get("/", listProducts);
productRouter.get("/:id", getProductById);
