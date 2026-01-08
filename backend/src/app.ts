import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import authRoutes from "./routes/auth.js";
import summarizeRoutes from "./routes/summarize.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/summarize", summarizeRoutes);

app.get("/health", (_: Request, res: Response) => {
	res.json({ status: "ok" });
});

export default app;
