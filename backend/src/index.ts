import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.route";
import { authRouter } from "./routes/auth.route";
import { productRouter } from "./routes/product.route";
import { cartRouter } from "./routes/cart.route";
import { orderRouter } from "./routes/order.route";
import { userRouter } from "./routes/user.route";
import { adminRouter } from "./routes/admin.route";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
