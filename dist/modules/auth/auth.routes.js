"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const auth_validator_1 = require("./auth.validator");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Stricter rate limit for login (brute-force protection)
const loginLimiter = (0, express_rate_limit_1.default)({
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
router.post("/login", loginLimiter, auth_validator_1.validateLoginInput, authController.login.bind(authController));
exports.default = router;
