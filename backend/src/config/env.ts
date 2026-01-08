import dotenv from "dotenv";
dotenv.config();

export const env = {
	PORT: process.env.PORT!,
	PAWAN_API_KEY: process.env.PAWAN_API_KEY!,
	JWT_SECRET: process.env.JWT_SECRET!,
};
