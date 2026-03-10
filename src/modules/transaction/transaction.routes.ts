import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { TransactionController } from "./transaction.controller";
import { validateCreateTransaction } from "./transaction.validator";

const router = Router();
const transactionController = new TransactionController();

// All transaction routes require authentication + CASHIER or ADMIN role
router.use(authenticate, authorize("CASHIER", "ADMIN"));

// POST /api/transactions — Create a new transaction
router.post(
  "/",
  validateCreateTransaction,
  transactionController.createTransaction.bind(transactionController)
);

// GET /api/transactions?shiftId=xxx — List transactions by shift
router.get(
  "/",
  transactionController.getTransactionsByShift.bind(transactionController)
);

// GET /api/transactions/history?date=YYYY-MM-DD — List daily transaction history
router.get(
  "/history",
  transactionController.getDailyHistory.bind(transactionController)
);

export default router;
