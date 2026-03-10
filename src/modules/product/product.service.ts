import { prisma } from "../../lib/prisma";

// --- Types ---

interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string | null;
}

// --- Service ---

export class ProductService {
  /**
   * Search products by name or SKU (case-insensitive).
   * Returns max 10 results, only items with stock > 0.
   */
  async searchProducts(query: string): Promise<ProductData[]> {
    if (!query || query.trim().length === 0) return [];

    const trimmed = query.trim();

    const products = await prisma.product.findMany({
      where: {
        AND: [
          { stock: { gt: 0 } },
          {
            OR: [
              { name: { contains: trimmed, mode: "insensitive" } },
              { sku: { contains: trimmed, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        category: true,
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return products;
  }

  /**
   * Get a single product by SKU (for barcode scan).
   */
  async getProductBySku(sku: string): Promise<ProductData | null> {
    const product = await prisma.product.findUnique({
      where: { sku },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
        category: true,
      },
    });

    return product;
  }
}
