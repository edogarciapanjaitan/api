"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const transaction_service_1 = require("./transaction.service");
const transactionService = new transaction_service_1.TransactionService();
class TransactionController {
    /**
     * POST /api/transactions
     * Create a new transaction within the active shift.
     */
    async createTransaction(req, res, next) {
        try {
            const { shiftId, items, paymentMethod, amountPaid, debitCardNo } = req.body;
            const transaction = await transactionService.createTransaction({
                shiftId,
                items,
                paymentMethod,
                amountPaid,
                debitCardNo,
            });
            res.status(201).json({
                success: true,
                message: "Transaksi berhasil",
                data: transaction,
            });
        }
        catch (error) {
            if (error instanceof transaction_service_1.TransactionError) {
                res.status(error.statusCode).json({
                    success: false,
                    message: error.message,
                });
                return;
            }
            next(error);
        }
    }
    /**
     * GET /api/transactions?shiftId=xxx
     * Get all transactions for a specific shift.
     */
    async getTransactionsByShift(req, res, next) {
        try {
            const shiftId = req.query.shiftId;
            if (!shiftId) {
                res.status(400).json({
                    success: false,
                    message: "Parameter shiftId wajib diisi",
                });
                return;
            }
            const transactions = await transactionService.getTransactionsByShift(shiftId);
            res.status(200).json({
                success: true,
                data: transactions,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/transactions/history?date=YYYY-MM-DD
     * Get daily transaction history for the authenticated user (cashier).
     */
    async getDailyHistory(req, res, next) {
        try {
            const userId = req.user.userId;
            const dateQuery = req.query.date;
            // Defalut to today if no date is provided
            const targetDate = dateQuery ? new Date(dateQuery) : new Date();
            if (isNaN(targetDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD.",
                });
                return;
            }
            const transactions = await transactionService.getDailyTransactions(userId, targetDate);
            res.status(200).json({
                success: true,
                data: transactions,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/transactions/dashboard-stats
     * Get aggregated dashboard statistics (total transactions and total items sold) per day.
     */
    async getDashboardStats(req, res, next) {
        try {
            const monthStr = req.query.month;
            const yearStr = req.query.year;
            const now = new Date();
            const targetMonth = monthStr ? parseInt(monthStr, 10) - 1 : now.getMonth();
            const targetYear = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
            // Start is the 1st of the target month
            const startDate = new Date(targetYear, targetMonth, 1);
            // End is the last day of the target month
            const endDate = new Date(targetYear, targetMonth + 1, 0);
            const stats = await transactionService.getDashboardStats(startDate, endDate);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/transactions/top-products
     * Get top 5 most sold products for a specific month and year.
     */
    async getTopProducts(req, res, next) {
        try {
            const monthStr = req.query.month;
            const yearStr = req.query.year;
            const now = new Date();
            const targetMonth = monthStr ? parseInt(monthStr, 10) - 1 : now.getMonth();
            const targetYear = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
            const startDate = new Date(targetYear, targetMonth, 1);
            const endDate = new Date(targetYear, targetMonth + 1, 0);
            const topProducts = await transactionService.getTopProducts(startDate, endDate);
            res.status(200).json({
                success: true,
                data: topProducts,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TransactionController = TransactionController;
