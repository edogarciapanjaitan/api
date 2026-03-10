import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { ShiftService, ShiftError } from "./shift.service";

const shiftService = new ShiftService();

export class ShiftController {
  /**
   * GET /api/shifts
   * Get the active shift for the authenticated user.
   */
  async getActiveShift(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const shift = await shiftService.getActiveShift(userId);

      res.status(200).json({
        success: true,
        data: shift, // null if no active shift
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/shifts/start
   * Start a new shift for the authenticated user.
   */
  async startShift(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { startingCash } = req.body;

      const shift = await shiftService.startShift(userId, startingCash);

      res.status(201).json({
        success: true,
        message: "Shift berhasil dimulai",
        data: shift,
      });
    } catch (error) {
      if (error instanceof ShiftError) {
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
  async endShift(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { endingCash } = req.body;

      const shift = await shiftService.endShift(userId, endingCash);

      res.status(200).json({
        success: true,
        message: "Shift berhasil diakhiri",
        data: shift,
      });
    } catch (error) {
      if (error instanceof ShiftError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
}
