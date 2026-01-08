import { Router, Response } from "express";
import { AuthRequest, requireSession } from "../middleware/requireSession.js";
import { summarizeEmail } from "../services/ai.js";

const router = Router();

// POST /summarize
router.post("/", requireSession, async (req: AuthRequest, res: Response) => {
	const {  emailText, summaryType } = req.body;

	if (!emailText || typeof emailText !== "string") {
		return res.status(400).json({ error: "emailText required" });
	}

	try {
		const summary = await summarizeEmail(emailText, summaryType);
		res.json({ summary });
	} catch {
		res.status(500).json({ error: "AI_UNAVAILABLE" });
	}
});

export default router;
