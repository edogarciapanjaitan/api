"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftController = void 0;
const shift_service_1 = require("./shift.service");
const shiftService = new shift_service_1.ShiftService();
class ShiftController {
    /**
     * GET /api/shifts
     * Get the active shift for the authenticated user.
     */
    async getActiveShift(req, res, next) {
        try {
            const userId = req.user.userId;
            const shift = await shiftService.getActiveShift(userId);
            res.status(200).json({
                success: true,
                data: shift, // null if no active shift
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/shifts/start
     * Start a new shift for the authenticated user.
     */
    async startShift(req, res, next) {
        try {
            const userId = req.user.userId;
            const { startingCash } = req.body;
            const shift = await shiftService.startShift(userId, startingCash);
            res.status(201).json({
                success: true,
                message: "Shift berhasil dimulai",
                data: shift,
            });
        }
        catch (error) {
            if (error instanceof shift_service_1.ShiftError) {
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
     * POST /api/shifts/end
     * End the active shift for the authenticated user.
     */
    async endShift(req, res, next) {
        try {
            const userId = req.user.userId;
            const { endingCash } = req.body;
            const shift = await shiftService.endShift(userId, endingCash);
            res.status(200).json({
                success: true,
                message: "Shift berhasil diakhiri",
                data: shift,
            });
        }
        catch (error) {
            if (error instanceof shift_service_1.ShiftError) {
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
     * GET /api/shifts/daily-report
     * Get historical shift reports.
     */
    async getDailyShiftReport(req, res, next) {
        try {
            const daysStr = req.query.days;
            const days = typeof daysStr === "string" ? parseInt(daysStr, 10) : 7;
            const report = await shiftService.getDailyShiftReport(days);
            res.status(200).json({
                success: true,
                data: report,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ShiftController = ShiftController;
