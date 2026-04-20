"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const userService = new user_service_1.UserService();
class UserController {
    /**
     * GET /api/users
     * Get paginated users
     */
    async getUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const result = await userService.getUsers(page, limit, search);
            res.status(200).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    pages: result.pages,
                    currentPage: page,
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/users
     * Create a new user.
     */
    async createUser(req, res, next) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: "Pengguna berhasil ditambahkan",
                data: user,
            });
        }
        catch (error) {
            if (error.message.includes("sudah terdaftar")) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * PUT /api/users/:id
     * Update an existing user.
     */
    async updateUser(req, res, next) {
        try {
            const id = req.params.id;
            const user = await userService.updateUser(id, req.body);
            res.status(200).json({
                success: true,
                message: "Pengguna berhasil diubah",
                data: user,
            });
        }
        catch (error) {
            if (error.message.includes("tidak ditemukan")) {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("sudah terdaftar")) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * DELETE /api/users/:id
     * Delete a user.
     */
    async deleteUser(req, res, next) {
        try {
            const id = req.params.id;
            await userService.deleteUser(id);
            res.status(200).json({
                success: true,
                message: "Pengguna berhasil dihapus",
            });
        }
        catch (error) {
            if (error.message.includes("satu-satunya akun Admin")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("riwayat shift")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
}
exports.UserController = UserController;
