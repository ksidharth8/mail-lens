import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

declare global {
	namespace Express {
		interface Request {
			user?: any;
		}
	}
}

const JWT_SECRET = env.JWT_SECRET!;

export function requireSession(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Missing session token" });
	}

	const token = authHeader.replace("Bearer ", "");

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch {
		return res.status(401).json({ error: "Invalid session token" });
	}
}

export interface AuthRequest extends Request {
  user?: {
    email: string
  }
}