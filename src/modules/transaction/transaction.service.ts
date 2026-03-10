import { prisma } from "../../lib/prisma";
import { PaymentMethod } from "@prisma/client";

// --- Types ---

interface TransactionItemInput {
  productId: string;
  quantity: number;
}

interface CreateTransactionInput {
  shiftId: string;
  items: TransactionItemInput[];
  paymentMethod: PaymentMethod;
  amountPaid?: number;
  debitCardNo?: string;
}

interface TransactionData {
  id: string;
  invoiceNumber: string;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  amountPaid: number | null;
  change: number | null;
  debitCardNo: string | null;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    priceAtSale: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }[];
}

// --- Service ---

export class TransactionService {
  /**
   * Create a new transaction within a shift.
   * Uses Prisma interactive transaction for atomicity:
   * - Generate invoice number
   * - Create Transaction + TransactionItems
   * - Decrease product stock
   * - Update shift sales totals
   */
  async createTransaction(
    input: CreateTransactionInput
  ): Promise<TransactionData> {
    const { shiftId, items, paymentMethod, amountPaid, debitCardNo } = input;

    return await prisma.$transaction(async (tx) => {
      // 1. Validate shift is still active
      const shift = await tx.shift.findUnique({
        where: { id: shiftId },
        select: { id: true, endTime: true },
      });

      if (!shift) {
        throw new TransactionError("Shift tidak ditemukan.", 404);
      }
      if (shift.endTime !== null) {
        throw new TransactionError(
          "Shift sudah ditutup. Tidak bisa membuat transaksi.",
          400
        );
      }

      // 2. Fetch all products and validate stock
      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true, price: true, stock: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalPrice = 0;
      const transactionItems: {
        productId: string;
        quantity: number;
        priceAtSale: number;
        subtotal: number;
      }[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new TransactionError(
            `Produk dengan ID ${item.productId} tidak ditemukan.`,
            404
          );
        }
        if (product.stock < item.quantity) {
          throw new TransactionError(
            `Stok "${product.name}" tidak cukup (tersedia: ${product.stock}, diminta: ${item.quantity}).`,
            400
          );
        }

        const subtotal = product.price * item.quantity;
        totalPrice += subtotal;

        transactionItems.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtSale: product.price,
          subtotal,
        });
      }

      // 3. Validate payment
      let change: number | null = null;

      if (paymentMethod === "CASH") {
        if (!amountPaid || amountPaid < totalPrice) {
          throw new TransactionError(
            `Uang bayar kurang. Total: Rp ${totalPrice.toLocaleString("id-ID")}, dibayar: Rp ${(amountPaid ?? 0).toLocaleString("id-ID")}.`,
            400
          );
        }
        change = amountPaid - totalPrice;
      }

      // 4. Generate invoice number (INV-YYYYMMDD-XXX)
      const invoiceNumber = await this.generateInvoiceNumber(tx);

      // 5. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          invoiceNumber,
          shiftId,
          totalPrice,
          paymentMethod,
          amountPaid: paymentMethod === "CASH" ? amountPaid! : null,
          change,
          debitCardNo: paymentMethod === "DEBIT" ? debitCardNo! : null,
          items: {
            create: transactionItems,
          },
        },
        select: {
          id: true,
          invoiceNumber: true,
          totalPrice: true,
          paymentMethod: true,
          amountPaid: true,
          change: true,
          debitCardNo: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              priceAtSale: true,
              subtotal: true,
              product: {
                select: { id: true, name: true, sku: true },
              },
            },
          },
        },
      });

      // 6. Decrease product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 7. Update shift sales totals
      if (paymentMethod === "CASH") {
        await tx.shift.update({
          where: { id: shiftId },
          data: { totalCashSales: { increment: totalPrice } },
        });
      } else {
        await tx.shift.update({
          where: { id: shiftId },
          data: { totalDebitSales: { increment: totalPrice } },
        });
      }

      return transaction;
    });
  }

  /**
   * Get all transactions for a specific shift.
   */
  async getTransactionsByShift(shiftId: string): Promise<TransactionData[]> {
    const transactions = await prisma.transaction.findMany({
      where: { shiftId },
      select: {
        id: true,
        invoiceNumber: true,
        totalPrice: true,
        paymentMethod: true,
        amountPaid: true,
        change: true,
        debitCardNo: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            priceAtSale: true,
            subtotal: true,
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions;
  }

  /**
   * Get all transactions for a specific user on a specific date.
   * Leverages relation filtering to ensure only the user's shifts are included.
   */
  async getDailyTransactions(
    userId: string,
    date: Date
  ): Promise<TransactionData[]> {
    // Determine start and end of the requested day (local time)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.transaction.findMany({
      where: {
        shift: {
          userId: userId,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        totalPrice: true,
        paymentMethod: true,
        amountPaid: true,
        change: true,
        debitCardNo: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            quantity: true,
            priceAtSale: true,
            subtotal: true,
            product: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return transactions;
  }

  /**
   * Generate invoice number: INV-YYYYMMDD-XXX
   * Counter resets per day.
   */
  private async generateInvoiceNumber(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
  ): Promise<string> {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, "0") +
      now.getDate().toString().padStart(2, "0");

    const prefix = `INV-${dateStr}-`;

    // Find the last invoice of today
    const lastTransaction = await tx.transaction.findFirst({
      where: {
        invoiceNumber: { startsWith: prefix },
      },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });

    let counter = 1;
    if (lastTransaction) {
      const lastNum = parseInt(
        lastTransaction.invoiceNumber.replace(prefix, ""),
        10
      );
      if (!isNaN(lastNum)) {
        counter = lastNum + 1;
      }
    }

    return `${prefix}${counter.toString().padStart(3, "0")}`;
  }
}

// --- Custom error class ---

export class TransactionError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "TransactionError";
    this.statusCode = statusCode;
  }
}
