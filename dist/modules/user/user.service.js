"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    /**
     * Get paginated users
     */
    async getUsers(page = 1, limit = 10, search = "") {
        const skip = (page - 1) * limit;
        const whereClause = {};
        if (search && search.trim().length > 0) {
            const trimmed = search.trim();
            whereClause.OR = [
                { name: { contains: trimmed, mode: "insensitive" } },
                { username: { contains: trimmed, mode: "insensitive" } },
            ];
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    username: true,
                    role: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.prisma.user.count({ where: whereClause }),
        ]);
        return {
            data: users,
            total,
            pages: Math.ceil(total / limit),
        };
    }
    /**
     * Create a new user (with password hashing)
     */
    async createUser(data) {
        const existing = await prisma_1.prisma.user.findUnique({
            where: { username: data.username },
            select: { id: true }
        });
        if (existing) {
            throw new Error(`Username ${data.username} sudah terdaftar.`);
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        return prisma_1.prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                password: hashedPassword,
                role: data.role,
            },
            select: { id: true, name: true, username: true, role: true },
        });
    }
    /**
     * Update an existing user. Can optionally update password.
     */
    async updateUser(id, data) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new Error(`Pengguna tidak ditemukan.`);
        }
        if (data.username && data.username !== existingUser.username) {
            const exists = await prisma_1.prisma.user.findUnique({
                where: { username: data.username },
                select: { id: true }
            });
            if (exists) {
                throw new Error(`Username ${data.username} sudah terdaftar.`);
            }
        }
        const updateData = {
            name: data.name,
            username: data.username,
            role: data.role,
        };
        if (data.password && data.password.trim().length > 0) {
            updateData.password = await bcrypt_1.default.hash(data.password, 10);
        }
        return prisma_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, username: true, role: true },
        });
    }
    /**
     * Delete a user
     */
    async deleteUser(id) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new Error("Pengguna tidak ditemukan.");
        }
        // Protection to prevent deleting the last admin
        if (existingUser.role === "ADMIN") {
            const totalAdmins = await prisma_1.prisma.user.count({ where: { role: "ADMIN" } });
            if (totalAdmins <= 1) {
                throw new Error("Tidak dapat menghapus satu-satunya akun Admin.");
            }
        }
        try {
            await prisma_1.prisma.user.delete({
                where: { id },
            });
        }
        catch (error) {
            if (error.code === 'P2003') {
                throw new Error("Tidak dapat menghapus pekerja ini karena memiliki riwayat shift/transaksi terkait.");
            }
            throw error;
        }
    }
}
exports.UserService = UserService;
