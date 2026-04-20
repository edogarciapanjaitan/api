import { prisma } from "../../lib/prisma";

// --- Types ---

interface ProductData {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string | null;
  imageUrl?: string | null;
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
          { isDeleted: false },
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
        imageUrl: true,
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
        imageUrl: true,
      },
    });

    return product;
  }

  
  // POS CATALOG METHODS
  

  /**
   * Get products for POS Catalog (Grid visualization)
   */
  async getCatalogPos(
    page: number = 1,
    limit: number = 16,
    category: string = ""
  ): Promise<{ data: ProductData[]; total: number; pages: number; categories: string[] }> {
    const skip = (page - 1) * limit;
    
    // Base where clause: stock > 0, not deleted
    const whereClause: any = { isDeleted: false, stock: { gt: 0 } };
    
    if (category && category !== "Semua") {
      whereClause.category = category;
    }

    // Get unique categories for the filter bar
    const rawCategories = await prisma.product.findMany({
      where: { isDeleted: false, stock: { gt: 0 } },
      select: { category: true },
      distinct: ['category'],
    });
    const categories = rawCategories
      .map(c => c.category)
      .filter((c): c is string => c !== null && c.trim().length > 0);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          category: true,
          imageUrl: true,
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return {
      data: products,
      total,
      pages: Math.ceil(total / limit),
      categories: ["Semua", ...categories],
    };
  }

  
  // ADMIN DASHBOARD
  

  /**
   * Get products with pagination and search for admin dashboard.
   */
  async getProductsAdmin(
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<{ data: ProductData[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const whereClause: any = { isDeleted: false };
    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      whereClause.OR = [
        { name: { contains: trimmed, mode: "insensitive" } },
        { sku: { contains: trimmed, mode: "insensitive" } },
      ];
    }

    // Execute query and count in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true,
          category: true,
          imageUrl: true,
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return {
      data: products,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new product. Ensures SKU is unique.
   */
  async createProduct(data: any): Promise<ProductData> {
    // Check if SKU exists
    const existing = await prisma.product.findUnique({
      where: { sku: data.sku },
      select: { id: true }
    });
    
    if (existing) {
      throw new Error(`Produk dengan SKU ${data.sku} sudah ada.`);
    }

    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        category: data.category,
        imageUrl: data.imageUrl,
      },
      select: { id: true, name: true, sku: true, price: true, stock: true, category: true, imageUrl: true },
    });
  }

  /**
   * Update an existing product. Ensures new SKU (if changed) is unique.
   */
  async updateProduct(id: string, data: any): Promise<ProductData> {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    
    if (!existingProduct) {
      throw new Error(`Produk tidak ditemukan.`);
    }

    // If changing SKU, ensure unique
    if (data.sku && data.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: data.sku },
        select: { id: true }
      });
      if (skuExists) {
        throw new Error(`Produk dengan SKU ${data.sku} sudah ada.`);
      }
    }

    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        stock: data.stock,
        category: data.category,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : undefined,
      },
      select: { id: true, name: true, sku: true, price: true, stock: true, category: true, imageUrl: true },
    });
  }

  /**
   * Adjust stock (increment or decrement).
   */
  async adjustStock(id: string, delta: number): Promise<ProductData> {
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      throw new Error("Produk tidak ditemukan.");
    }

    const newStock = existingProduct.stock + delta;
    if (newStock < 0) {
      throw new Error(`Operasi gagal. Stok tidak bisa kurang dari 0 (stok saat ini: ${existingProduct.stock}).`);
    }

    return prisma.product.update({
      where: { id },
      data: { stock: newStock },
      select: { id: true, name: true, sku: true, price: true, stock: true, category: true, imageUrl: true }
    });
  }

  /**
   * Delete a product. 
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        throw new Error("Produk tidak ditemukan.");
      }

      await prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          sku: `${product.sku}-DELETED-${Date.now()}`
        }
      });
    } catch (error: any) {
      // Handle Prisma foreign key constraint error (if still using true delete somehow)
      if (error.code === 'P2003') {
        throw new Error("Tidak dapat menghapus produk ini karena sudah ada di riwayat transaksi.");
      }
      throw error;
    }
  }
}
