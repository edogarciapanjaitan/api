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

  // ==========================================
  // ADMIN DASHBOARD HANDLERS
  // ==========================================

  /**
   * GET /api/products
   * Get paginated products for admin.
   */
  async getAdminProducts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || "";

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
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products
   * Create a new product.
   */
  async createProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan",
        data: product,
      });
    } catch (error: any) {
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
  async updateProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const product = await productService.updateProduct(id, req.body);

      res.status(200).json({
        success: true,
        message: "Produk berhasil diubah",
        data: product,
      });
    } catch (error: any) {
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
  async adjustStock(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const delta = req.body.delta as number;
      const product = await productService.adjustStock(id, delta);

      res.status(200).json({
        success: true,
        message: "Stok berhasil diperbarui",
        data: product,
      });
    } catch (error: any) {
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
  async deleteProduct(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus",
      });
    } catch (error: any) {
      if (error.message.includes("di riwayat transaksi")) {
         res.status(400).json({ success: false, message: error.message });
         return;
      }
      next(error);
    }
  }
}
