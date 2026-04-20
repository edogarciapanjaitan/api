"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function requireEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}
exports.config = {
    port: parseInt(process.env.PORT || "3001", 10),
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
    jwt: {
        secret: requireEnv("JWT_SECRET"),
        expiresIn: (process.env.JWT_EXPIRES_IN || "8h"),
    },
};
