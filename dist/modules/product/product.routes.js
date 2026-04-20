"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)();
const productController = new product_controller_1.ProductController();
// All product routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /api/products/catalog?page=1&limit=16&category= — Paginated catalog
router.get("/catalog", (0, auth_middleware_1.authorize)("CASHIER", "ADMIN"), productController.getCatalogPos.bind(productController));
// GET /api/products/search?q=xxx — Search products
router.get("/search", (0, auth_middleware_1.authorize)("CASHIER", "ADMIN"), productController.searchProducts.bind(productController));
const product_validator_1 = require("./product.validator");
const file_upload_middleware_1 = require("../../middleware/file-upload.middleware");
router.get("/", (0, auth_middleware_1.authorize)("ADMIN"), productController.getAdminProducts.bind(productController));
router.post("/", (0, auth_middleware_1.authorize)("ADMIN"), (0, file_upload_middleware_1.uploadSingle)("image"), product_validator_1.validateCreateProduct, productController.createProduct.bind(productController));
router.put("/:id", (0, auth_middleware_1.authorize)("ADMIN"), (0, file_upload_middleware_1.uploadSingle)("image"), product_validator_1.validateUpdateProduct, productController.updateProduct.bind(productController));
router.post("/:id/stock", (0, auth_middleware_1.authorize)("ADMIN"), product_validator_1.validateAdjustStock, productController.adjustStock.bind(productController));
router.delete("/:id", (0, auth_middleware_1.authorize)("ADMIN"), productController.deleteProduct.bind(productController));
exports.default = router;
