import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  username: z.string().min(3, "Username minimal 3 karakter").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh menggunakan huruf, angka, dan garis bawah"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["CASHIER", "ADMIN"]),
});

const updateUserSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
  username: z.string().min(3, "Username minimal 3 karakter").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh menggunakan huruf, angka, dan garis bawah").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal('')),
  role: z.enum(["CASHIER", "ADMIN"]).optional(),
});

export const validateCreateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = createUserSchema.parse(req.body);
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

export const validateUpdateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    req.body = updateUserSchema.parse(req.body);
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
