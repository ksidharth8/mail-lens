import express from "express";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { env } from "../config/env.js";

const router = express.Router();
const JWT_SECRET = env.JWT_SECRET!;

// POST /auth/google
router.post("/google", async (req: Request, res: Response) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ error: "Missing Authorization header" });
		}

		const googleToken = authHeader.replace("Bearer ", "");

		const googleRes = await fetch(
			"https://www.googleapis.com/oauth2/v3/userinfo",
			{
				headers: {
					Authorization: `Bearer ${googleToken}`,
				},
			}
		);

		if (!googleRes.ok) {
			return res.status(401).json({ error: "Invalid Google access token" });
		}

		const payload = (await googleRes.json()) as {
			sub: string;
			email: string;
			name: string;
		};

		const sessionToken = jwt.sign(
			{
				sub: payload.sub,
				email: payload.email,
				name: payload.name,
			},
			JWT_SECRET
		);

		res.json({ sessionToken });
	} catch (err) {
		console.error("Auth error:", err);
		res.status(401).json({ error: "Authentication failed" });
	}
});

export default router;
