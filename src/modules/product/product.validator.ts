import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter").max(100),
  sku: z.string().min(3, "SKU minimal 3 karakter").max(50),
  price: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  category: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const updateProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter").max(100).optional(),
  sku: z.string().min(3, "SKU minimal 3 karakter").max(50).optional(),
  price: z.coerce.number().int().min(0, "Harga tidak boleh negatif").optional(),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif").optional(),
  category: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

const adjustStockSchema = z.object({
  delta: z.number().int({ message: "Delta stok harus berupa angka bulat" }),
});

export const validateCreateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = createProductSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const validateUpdateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = updateProductSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const validateAdjustStock = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = adjustStockSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
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
