"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const cloudinary_1 = require("../../config/cloudinary");
const productService = new product_service_1.ProductService();
class ProductController {
    /**
     * GET /api/products/search?q=xxx
     * Search products by name or SKU.
     */
    async searchProducts(req, res, next) {
        try {
            const query = req.query.q || "";
            const products = await productService.searchProducts(query);
            res.status(200).json({
                success: true,
                data: products,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/products/catalog?page=1&limit=16&category=
     * Get paginated products formatted for POS Catalog Grid.
     */
    async getCatalogPos(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 16;
            const category = req.query.category || "";
            const result = await productService.getCatalogPos(page, limit, category);
            res.status(200).json({
                success: true,
                data: result.data,
                meta: {
                    total: result.total,
                    pages: result.pages,
                    currentPage: page,
                    categories: result.categories,
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // ADMIN DASHBOARD HANDLERS
    /**
     * GET /api/products
     * Get paginated products for admin.
     */
    async getAdminProducts(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || "";
            const result = await productService.getProductsAdmin(page, limit, search);
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
     * POST /api/products
     * Create a new product.
     */
    async createProduct(req, res, next) {
        try {
            if (req.file) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, "cashier_products");
                req.body.imageUrl = uploadResult.secure_url;
            }
            const product = await productService.createProduct(req.body);
            res.status(201).json({
                success: true,
                message: "Produk berhasil ditambahkan",
                data: product,
            });
        }
        catch (error) {
            if (error.message.includes("sudah ada")) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * PUT /api/products/:id
     * Update an existing product.
     */
    async updateProduct(req, res, next) {
        try {
            const id = req.params.id;
            if (req.file) {
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(req.file.buffer, "cashier_products");
                req.body.imageUrl = uploadResult.secure_url;
            }
            const product = await productService.updateProduct(id, req.body);
            res.status(200).json({
                success: true,
                message: "Produk berhasil diubah",
                data: product,
            });
        }
        catch (error) {
            if (error.message.includes("tidak ditemukan")) {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("sudah ada")) {
                res.status(409).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * POST /api/products/:id/stock
     * Adjust stock of an existing product.
     */
    async adjustStock(req, res, next) {
        try {
            const id = req.params.id;
            const delta = req.body.delta;
            const product = await productService.adjustStock(id, delta);
            res.status(200).json({
                success: true,
                message: "Stok berhasil diperbarui",
                data: product,
            });
        }
        catch (error) {
            if (error.message.includes("tidak ditemukan")) {
                res.status(404).json({ success: false, message: error.message });
                return;
            }
            if (error.message.includes("Operasi gagal")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
    /**
     * DELETE /api/products/:id
     * Delete a product.
     */
    async deleteProduct(req, res, next) {
        try {
            const id = req.params.id;
            await productService.deleteProduct(id);
            res.status(200).json({
                success: true,
                message: "Produk berhasil dihapus",
            });
        }
        catch (error) {
            if (error.message.includes("di riwayat transaksi")) {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            next(error);
        }
    }
}
exports.ProductController = ProductController;
