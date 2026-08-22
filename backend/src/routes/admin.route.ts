import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole";
import { getSummary } from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(authMiddleware);

adminRouter.get("/summary", requireRole("admin"), getSummary);
