import { Request, Response, NextFunction } from "express";
import { AuthService, AuthError } from "./auth.service";

const authService = new AuthService();

export class AuthController {
  /**
   * POST /api/auth/login
   * Handles login request — delegates to AuthService.
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      const result = await authService.login(username, password);

      res.status(200).json({
        success: true,
        message: "Login berhasil",
        data: result,
      });
    } catch (error) {
      if (error instanceof AuthError) {
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
