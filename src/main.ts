import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/config";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import shiftRoutes from "./modules/shift/shift.routes";
import productRoutes from "./modules/product/product.routes";
import transactionRoutes from "./modules/transaction/transaction.routes";
import userRoutes from "./modules/user/user.routes";

// --- Create Express app ---

const app = express();

// --- Security Middleware ---

// HTTP security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Global rate limiter (100 req/min per IP)
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Terlalu banyak request. Coba lagi nanti.",
    },
  })
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// --- Health Check ---

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "API is running" });
});

// --- Routes ---

app.use("/api/auth", authRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/products", productRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);

// --- Global Error Handler ---

app.use(errorHandler);

// --- Start Server ---

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📋 Health check: http://localhost:${config.port}/api/health`);
});

export default app;
