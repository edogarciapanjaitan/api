import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { ProductService } from "./product.service";

const productService = new ProductService();

export class ProductController {
  /**
   * GET /api/products/search?q=xxx
   * Search products by name or SKU.
   */
  async searchProducts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = (req.query.q as string) || "";
      const products = await productService.searchProducts(query);

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }
}
