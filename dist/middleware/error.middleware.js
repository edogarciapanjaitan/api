"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
/**
 * Global error handler.
 * Catches unhandled errors and returns a safe JSON response.
 */
function errorHandler(err, _req, res, _next) {
    console.error(`[ERROR] ${err.message}`, err.stack);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Terjadi kesalahan pada server"
            : err.message,
    });
}
