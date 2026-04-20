"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const transaction_controller_1 = require("./transaction.controller");
const transaction_validator_1 = require("./transaction.validator");
const router = (0, express_1.Router)();
const transactionController = new transaction_controller_1.TransactionController();
// All transaction routes require authentication + CASHIER or ADMIN role
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("CASHIER", "ADMIN"));
// POST /api/transactions — Create a new transaction
router.post("/", transaction_validator_1.validateCreateTransaction, transactionController.createTransaction.bind(transactionController));
// GET /api/transactions?shiftId=xxx — List transactions by shift
router.get("/", transactionController.getTransactionsByShift.bind(transactionController));
// GET /api/transactions/dashboard-stats — Admin dashboard stats
router.get("/dashboard-stats", (0, auth_middleware_1.authorize)("ADMIN"), transactionController.getDashboardStats.bind(transactionController));
// GET /api/transactions/top-products — Admin dashboard top products
router.get("/top-products", (0, auth_middleware_1.authorize)("ADMIN"), transactionController.getTopProducts.bind(transactionController));
// GET /api/transactions/history?date=YYYY-MM-DD — List daily transaction history
router.get("/history", transactionController.getDailyHistory.bind(transactionController));
exports.default = router;
