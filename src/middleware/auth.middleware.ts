import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

// --- Extend Express Request type ---

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// --- JWT Verification Middleware ---

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kadaluarsa",
    });
  }
}

// --- Role Authorization Middleware ---

export function authorize(...allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Tidak terautentikasi",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk resource ini",
      });
      return;
    }

    next();
  };
}
