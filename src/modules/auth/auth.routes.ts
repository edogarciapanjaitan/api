import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { validateLoginInput } from "./auth.validator";

const router = Router();
const authController = new AuthController();

// Stricter rate limit for login (brute-force protection)
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 attempts per minute per IP
  message: {
    success: false,
    message: "Terlalu banyak percobaan login. Coba lagi dalam 1 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  validateLoginInput,
  authController.login.bind(authController)
);

export default router;
