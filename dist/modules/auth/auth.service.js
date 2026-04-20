"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const config_1 = require("../../config/config");
class AuthService {
    async login(username, password) {
        // 1. Find user — select only needed fields (efficient query)
        const user = await prisma_1.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                password: true,
                role: true,
            },
        });
        if (!user) {
            throw new AuthError("Username atau password salah", 401);
        }
        // 2. Verify password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AuthError("Username atau password salah", 401);
        }
        // 3. Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        // 4. Return token + safe user data (no password)
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
            },
        };
    }
}
exports.AuthService = AuthService;
// --- Custom error class ---
class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "AuthError";
        this.statusCode = statusCode;
    }
}
exports.AuthError = AuthError;
