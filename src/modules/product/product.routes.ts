import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { ProductController } from "./product.controller";

const router = Router();
const productController = new ProductController();

// All product routes require authentication
router.use(authenticate);

// ==========================================
// SHARED ROUTES (CASHIER & ADMIN)
// ==========================================

// GET /api/products/search?q=xxx — Search products
router.get(
  "/search",
  authorize("CASHIER", "ADMIN"),
  productController.searchProducts.bind(productController)
);

// ==========================================
// ADMIN ONLY ROUTES
// ==========================================

import { validateCreateProduct, validateUpdateProduct, validateAdjustStock } from "./product.validator";

router.get(
  "/",
  authorize("ADMIN"),
  productController.getAdminProducts.bind(productController)
);

router.post(
  "/",
  authorize("ADMIN"),
  validateCreateProduct,
  productController.createProduct.bind(productController)
);

router.put(
  "/:id",
  authorize("ADMIN"),
  validateUpdateProduct,
  productController.updateProduct.bind(productController)
);

router.post(
  "/:id/stock",
  authorize("ADMIN"),
  validateAdjustStock,
  productController.adjustStock.bind(productController)
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  productController.deleteProduct.bind(productController)
);

export default router;
