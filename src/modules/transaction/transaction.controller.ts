import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { TransactionService, TransactionError } from "./transaction.service";

const transactionService = new TransactionService();

export class TransactionController {
  /**
   * POST /api/transactions
   * Create a new transaction within the active shift.
   */
  async createTransaction(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { shiftId, items, paymentMethod, amountPaid, debitCardNo } =
        req.body;

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
    } catch (error) {
      if (error instanceof TransactionError) {
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
  async getTransactionsByShift(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const shiftId = req.query.shiftId as string;

      if (!shiftId) {
        res.status(400).json({
          success: false,
          message: "Parameter shiftId wajib diisi",
        });
        return;
      }

      const transactions =
        await transactionService.getTransactionsByShift(shiftId);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/transactions/history?date=YYYY-MM-DD
   * Get daily transaction history for the authenticated user (cashier).
   */
  async getDailyHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const dateQuery = req.query.date as string;
      
      // Defalut to today if no date is provided
      const targetDate = dateQuery ? new Date(dateQuery) : new Date();

      if (isNaN(targetDate.getTime())) {
        res.status(400).json({
          success: false,
          message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD.",
        });
        return;
      }

      const transactions = await transactionService.getDailyTransactions(
        userId,
        targetDate
      );

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}
