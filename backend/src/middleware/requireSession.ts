import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET!;

export interface AuthRequest extends Request {
	user?: {
		sub: string;
		email: string;
		name?: string;
	};
}

export function requireSession(
	req: AuthRequest,
	res: Response,
	next: NextFunction
) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Missing session token" });
	}

	const token = authHeader.replace("Bearer ", "");

	try {
		const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest["user"];
		req.user = decoded;
		next();
	} catch {
		return res.status(401).json({ error: "Invalid session token" });
	}
}
