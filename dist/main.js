"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config/config");
const error_middleware_1 = require("./middleware/error.middleware");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const shift_routes_1 = __importDefault(require("./modules/shift/shift.routes"));
const product_routes_1 = __importDefault(require("./modules/product/product.routes"));
const transaction_routes_1 = __importDefault(require("./modules/transaction/transaction.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
// --- Create Express app ---
const app = (0, express_1.default)();
// Serve static uploads
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// --- Security Middleware ---
// HTTP security headers
app.use((0, helmet_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Global rate limiter (100 req/min per IP)
app.use((0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Terlalu banyak request. Coba lagi nanti.",
    },
}));
// Body parser
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
// --- Health Check ---
app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "API is running" });
});
// --- Routes ---
app.use("/api/auth", auth_routes_1.default);
app.use("/api/shifts", shift_routes_1.default);
app.use("/api/products", product_routes_1.default);
app.use("/api/transactions", transaction_routes_1.default);
app.use("/api/users", user_routes_1.default);
// --- Global Error Handler ---
app.use(error_middleware_1.errorHandler);
// --- Start Server ---
app.listen(config_1.config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config_1.config.port}`);
    console.log(`📋 Health check: http://localhost:${config_1.config.port}/api/health`);
});
exports.default = app;
