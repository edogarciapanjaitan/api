import { Request, Response, NextFunction } from "express";

// --- Sanitization helpers ---

function sanitizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

// --- Validation rules ---

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

interface ValidationError {
  field: string;
  message: string;
}

// --- Validator middleware ---

export function validateLoginInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];

  // Sanitize
  const username = sanitizeString(req.body.username);
  const password = sanitizeString(req.body.password);

  // Validate username
  if (!username) {
    errors.push({ field: "username", message: "Username wajib diisi" });
  } else if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    errors.push({
      field: "username",
      message: `Username harus antara ${USERNAME_MIN}-${USERNAME_MAX} karakter`,
    });
  } else if (!USERNAME_REGEX.test(username)) {
    errors.push({
      field: "username",
      message: "Username hanya boleh berisi huruf, angka, dan underscore",
    });
  }

  // Validate password
  if (!password) {
    errors.push({ field: "password", message: "Password wajib diisi" });
  } else if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    errors.push({
      field: "password",
      message: `Password harus antara ${PASSWORD_MIN}-${PASSWORD_MAX} karakter`,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors,
    });
    return;
  }

  // Attach sanitized values back to body
  req.body.username = username;
  req.body.password = password;

  next();
}
