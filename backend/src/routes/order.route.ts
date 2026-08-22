import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkout, getOrderById, listOrders } from "../controllers/order.controller";

export const orderRouter = Router();

orderRouter.use(authMiddleware);

orderRouter.post("/checkout", checkout);
orderRouter.get("/", listOrders);
orderRouter.get("/:id", getOrderById);
