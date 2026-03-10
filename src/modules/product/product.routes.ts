import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { ProductController } from "./product.controller";

const router = Router();
const productController = new ProductController();

// All product routes require authentication
router.use(authenticate, authorize("CASHIER", "ADMIN"));

// GET /api/products/search?q=xxx — Search products
router.get(
  "/search",
  productController.searchProducts.bind(productController)
);

export default router;
