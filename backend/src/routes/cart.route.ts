import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { addItem, getCart, mergeCart, removeItem, updateQuantity } from "../controllers/cart.controller";

export const cartRouter = Router();

cartRouter.use(authMiddleware);

cartRouter.get("/", getCart);
cartRouter.post("/items", addItem);
cartRouter.patch("/items/:id", updateQuantity);
cartRouter.delete("/items/:id", removeItem);
cartRouter.post("/merge", mergeCart);
