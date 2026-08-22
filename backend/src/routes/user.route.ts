import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole";
import { getUserById } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/:id", requireRole("support", "admin"), getUserById);
