// import OpenAI from 'openai'
import { env } from "../config/env.js";

const API_URL = "https://api.pawan.krd/v1/chat/completions";
const MODEL = "gpt-oss-20b";

const SYSTEM_PROMPT = `
You are an email summarization engine.

Global rules you MUST follow:
- Output plain text only.
- Follow the output format EXACTLY as specified.
- Do NOT use markdown.
- Do NOT add extra headings, labels, or explanations beyond what is requested.
- Do NOT repeat the task or these instructions.
- Do NOT add information not present in the email.
- Preserve factual accuracy and intent.
- Remove redundancy and fluff.
- Use neutral, professional language.
- No emojis, greetings, or sign-offs.
`.trim();

function getShortPrompt(clamped: string): string {
	return `
Email content:
"""
${clamped}
"""

Task:
Write a SHORT summary.

Rules:
- Use 1 to 3 complete sentences.
- Focus only on the core message and final outcome.
- No bullets, symbols, or labels.
- Plain text only.
`.trim();
}

function getBulletsPrompt(clamped: string): string {
	return `
Email content:
"""
${clamped}
"""

Task:
Summarize the email into bullet points.

STRICT OUTPUT FORMAT:
• Sentence one.
• Sentence two.
• Sentence three.

Rules:
- Use exactly 3 to 5 bullets.
- Each bullet must be a single complete sentence.
- Each bullet must cover a distinct key point.
- Use the bullet symbol "•" only.
- No headings, no extra text, no blank lines.
- Plain text only.
`.trim();
}

function getDetailedPrompt(clamped: string): string {
	return `
Email content:
"""
${clamped}
"""

Task:
Produce a DETAILED summary using EXACTLY the following structure:

SHORT SUMMARY:
<2 to 3 complete sentences>

KEY POINTS:
• Sentence one.
• Sentence two.
• Sentence three.

DETAILED EXPLANATION:
<Clear, well-structured paragraphs preserving context, decisions, requests, timelines, and outcomes>

Rules:
- Use the headings EXACTLY as written.
- Use the bullet symbol "•" only in KEY POINTS.
- Use 3 to 5 bullets in KEY POINTS.
- Do NOT add or remove sections.
- Plain text only.
`.trim();
}

function clampEmail(text: string): string {
	const MAX = 8000;
	if (text.length <= MAX) return text;

	const half = MAX / 2;
	return (
		text.slice(0, half) +
		"\n--- trimmed ---\n" +
		text.slice(text.length - half)
	);
}

export async function summarizeEmail(
	emailText: string,
	summaryType: "short" | "bullets" | "detailed"
): Promise<string> {
	const clamped = clampEmail(emailText);

	const userPrompt =
		summaryType === "short"
			? getShortPrompt(clamped)
			: summaryType === "bullets"
			? getBulletsPrompt(clamped)
			: getDetailedPrompt(clamped);

	const fetch = await import("node-fetch").then((m) => m.default);
	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${env.PAWAN_API_KEY}`,
		},
		body: JSON.stringify({
			model: MODEL,
			temperature: 0.8,
			messages: [
				{
					role: "system",
					content: SYSTEM_PROMPT,
				},
				{
					role: "user",
					content: userPrompt,
				},
			],
		}),
	});

	if (!response.ok) {
		console.error(
			"AI request failed with status:",
			response.status,
			await response.text()
		);
		throw new Error("AI request failed");
	}

	const data = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};

	console.log(
		"AI response data:",
		data.choices?.[0]?.message?.content?.trim() ?? ""
	);
	return data.choices?.[0]?.message?.content?.trim() ?? "";
}
