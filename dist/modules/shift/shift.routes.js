"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const shift_controller_1 = require("./shift.controller");
const shift_validator_1 = require("./shift.validator");
const router = (0, express_1.Router)();
const shiftController = new shift_controller_1.ShiftController();
// All shift routes require authentication + CASHIER or ADMIN role
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("CASHIER", "ADMIN"));
// GET /api/shifts/daily-report — Get daily shift report (Admin only)
router.get("/daily-report", (0, auth_middleware_1.authorize)("ADMIN"), shiftController.getDailyShiftReport.bind(shiftController));
// GET /api/shifts — Get active shift
router.get("/", shiftController.getActiveShift.bind(shiftController));
// POST /api/shifts/start — Start a new shift
router.post("/start", shift_validator_1.validateStartShift, shiftController.startShift.bind(shiftController));
// POST /api/shifts/end — End active shift
router.post("/end", shift_validator_1.validateEndShift, shiftController.endShift.bind(shiftController));
exports.default = router;
