import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { ShiftController } from "./shift.controller";
import { validateStartShift, validateEndShift } from "./shift.validator";

const router = Router();
const shiftController = new ShiftController();

// All shift routes require authentication + CASHIER or ADMIN role
router.use(authenticate, authorize("CASHIER", "ADMIN"));

// GET /api/shifts/daily-report — Get daily shift report (Admin only)
router.get(
  "/daily-report",
  authorize("ADMIN"),
  shiftController.getDailyShiftReport.bind(shiftController)
);

// GET /api/shifts — Get active shift
router.get("/", shiftController.getActiveShift.bind(shiftController));

// POST /api/shifts/start — Start a new shift
router.post(
  "/start",
  validateStartShift,
  shiftController.startShift.bind(shiftController)
);

// POST /api/shifts/end — End active shift
router.post(
  "/end",
  validateEndShift,
  shiftController.endShift.bind(shiftController)
);

export default router;
