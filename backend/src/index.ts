import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.route";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api", healthRouter);

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
