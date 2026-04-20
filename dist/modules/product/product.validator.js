"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdjustStock = exports.validateUpdateProduct = exports.validateCreateProduct = void 0;
const zod_1 = require("zod");
const createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Nama produk minimal 3 karakter").max(100),
    sku: zod_1.z.string().min(3, "SKU minimal 3 karakter").max(50),
    price: zod_1.z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
    stock: zod_1.z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
    category: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().optional().nullable(),
});
const updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Nama produk minimal 3 karakter").max(100).optional(),
    sku: zod_1.z.string().min(3, "SKU minimal 3 karakter").max(50).optional(),
    price: zod_1.z.coerce.number().int().min(0, "Harga tidak boleh negatif").optional(),
    stock: zod_1.z.coerce.number().int().min(0, "Stok tidak boleh negatif").optional(),
    category: zod_1.z.string().optional().nullable(),
    imageUrl: zod_1.z.string().optional().nullable(),
});
const adjustStockSchema = zod_1.z.object({
    delta: zod_1.z.number().int({ message: "Delta stok harus berupa angka bulat" }),
});
const validateCreateProduct = (req, res, next) => {
    try {
        req.body = createProductSchema.parse(req.body);
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
exports.validateCreateProduct = validateCreateProduct;
const validateUpdateProduct = (req, res, next) => {
    try {
        req.body = updateProductSchema.parse(req.body);
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
exports.validateUpdateProduct = validateUpdateProduct;
const validateAdjustStock = (req, res, next) => {
    try {
        req.body = adjustStockSchema.parse(req.body);
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
exports.validateAdjustStock = validateAdjustStock;
