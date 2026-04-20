"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    /**
     * POST /api/auth/login
     * Handles login request — delegates to AuthService.
     */
    async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const result = await authService.login(username, password);
            res.status(200).json({
                success: true,
                message: "Login berhasil",
                data: result,
            });
        }
        catch (error) {
            if (error instanceof auth_service_1.AuthError) {
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
exports.AuthController = AuthController;
