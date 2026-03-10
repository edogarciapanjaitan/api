import { Request, Response, NextFunction } from "express";

// --- Sanitization helpers ---

function sanitizeNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  if (isNaN(num)) return null;
  return num;
}

// --- Validation rules ---

const CASH_MIN = 0;
const CASH_MAX = 100_000_000; // 100 juta

interface ValidationError {
  field: string;
  message: string;
}

// --- Start Shift Validator ---

export function validateStartShift(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];

  const startingCash = sanitizeNumber(req.body.startingCash);

  if (startingCash === null) {
    errors.push({ field: "startingCash", message: "Uang awal wajib diisi" });
  } else if (startingCash < CASH_MIN) {
    errors.push({
      field: "startingCash",
      message: "Uang awal tidak boleh negatif",
    });
  } else if (startingCash > CASH_MAX) {
    errors.push({
      field: "startingCash",
      message: `Uang awal maksimal Rp ${CASH_MAX.toLocaleString("id-ID")}`,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: "Validasi gagal", errors });
    return;
  }

  req.body.startingCash = startingCash;
  next();
}

// --- End Shift Validator ---

export function validateEndShift(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];

  const endingCash = sanitizeNumber(req.body.endingCash);

  if (endingCash === null) {
    errors.push({ field: "endingCash", message: "Uang akhir wajib diisi" });
  } else if (endingCash < CASH_MIN) {
    errors.push({
      field: "endingCash",
      message: "Uang akhir tidak boleh negatif",
    });
  } else if (endingCash > CASH_MAX) {
    errors.push({
      field: "endingCash",
      message: `Uang akhir maksimal Rp ${CASH_MAX.toLocaleString("id-ID")}`,
    });
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: "Validasi gagal", errors });
    return;
  }

  req.body.endingCash = endingCash;
  next();
}
