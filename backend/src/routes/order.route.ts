import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole";
import {
  checkout,
  getOrderById,
  listOrders,
  updateOrderStatus,
} from "../controllers/order.controller";

export const orderRouter = Router();

orderRouter.use(authMiddleware);

orderRouter.post("/checkout", checkout);
orderRouter.get("/", listOrders);
orderRouter.get("/:id", getOrderById);
orderRouter.patch("/:id/status", requireRole("support", "admin"), updateOrderStatus);
