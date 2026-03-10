import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwt: {
    secret: requireEnv("JWT_SECRET"),
    expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as SignOptions["expiresIn"],
  },
} as const;
