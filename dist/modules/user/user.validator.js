"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateUser = exports.validateCreateUser = void 0;
const zod_1 = require("zod");
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nama minimal 2 karakter").max(100),
    username: zod_1.z.string().min(3, "Username minimal 3 karakter").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh menggunakan huruf, angka, dan garis bawah"),
    password: zod_1.z.string().min(6, "Password minimal 6 karakter"),
    role: zod_1.z.enum(["CASHIER", "ADMIN"]),
});
const updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
    username: zod_1.z.string().min(3, "Username minimal 3 karakter").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh menggunakan huruf, angka, dan garis bawah").optional(),
    password: zod_1.z.string().min(6, "Password minimal 6 karakter").optional().or(zod_1.z.literal('')),
    role: zod_1.z.enum(["CASHIER", "ADMIN"]).optional(),
});
const validateCreateUser = (req, res, next) => {
    try {
        req.body = createUserSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validasi gagal",
                errors: error.flatten().fieldErrors,
            });
            return;
        }
        next(error);
    }
};
exports.validateCreateUser = validateCreateUser;
const validateUpdateUser = (req, res, next) => {
    try {
        req.body = updateUserSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: "Validasi gagal",
                errors: error.flatten().fieldErrors,
            });
            return;
        }
        next(error);
    }
};
exports.validateUpdateUser = validateUpdateUser;
