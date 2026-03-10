import { Request, Response, NextFunction } from "express";

// --- Types ---

interface ValidationError {
  field: string;
  message: string;
}

// --- Create Transaction Validator ---

export function validateCreateTransaction(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];
  const { items, paymentMethod, amountPaid, debitCardNo } = req.body;

  // Validate items
  if (!Array.isArray(items) || items.length === 0) {
    errors.push({
      field: "items",
      message: "Keranjang tidak boleh kosong",
    });
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (!item.productId || typeof item.productId !== "string") {
        errors.push({
          field: `items[${i}].productId`,
          message: "Product ID wajib diisi",
        });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || !Number.isInteger(qty) || qty < 1) {
        errors.push({
          field: `items[${i}].quantity`,
          message: "Quantity harus bilangan bulat minimal 1",
        });
      } else {
        items[i].quantity = qty;
      }
    }
  }

  // Validate payment method
  if (!paymentMethod || !["CASH", "DEBIT"].includes(paymentMethod)) {
    errors.push({
      field: "paymentMethod",
      message: 'Metode pembayaran harus "CASH" atau "DEBIT"',
    });
  }

  // Validate CASH payment
  if (paymentMethod === "CASH") {
    const paid = Number(amountPaid);
    if (isNaN(paid) || paid <= 0) {
      errors.push({
        field: "amountPaid",
        message: "Uang bayar wajib diisi untuk pembayaran tunai",
      });
    } else {
      req.body.amountPaid = paid;
    }
  }

  // Validate DEBIT payment
  if (paymentMethod === "DEBIT") {
    if (
      !debitCardNo ||
      typeof debitCardNo !== "string" ||
      debitCardNo.trim().length < 4 ||
      debitCardNo.trim().length > 20
    ) {
      errors.push({
        field: "debitCardNo",
        message: "Nomor kartu debit harus 4-20 karakter",
      });
    } else {
      req.body.debitCardNo = debitCardNo.trim();
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ success: false, message: "Validasi gagal", errors });
    return;
  }

  next();
}
