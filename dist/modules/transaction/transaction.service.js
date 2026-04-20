"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionError = exports.TransactionService = void 0;
const prisma_1 = require("../../lib/prisma");
// --- Service ---
class TransactionService {
    /**
     * Create a new transaction within a shift.
     * Uses Prisma interactive transaction for atomicity:
     * - Generate invoice number
     * - Create Transaction + TransactionItems
     * - Decrease product stock
     * - Update shift sales totals
     */
    async createTransaction(input) {
        const { shiftId, items, paymentMethod, amountPaid, debitCardNo } = input;
        return await prisma_1.prisma.$transaction(async (tx) => {
            // 1. Validate shift is still active
            const shift = await tx.shift.findUnique({
                where: { id: shiftId },
                select: { id: true, endTime: true },
            });
            if (!shift) {
                throw new TransactionError("Shift tidak ditemukan.", 404);
            }
            if (shift.endTime !== null) {
                throw new TransactionError("Shift sudah ditutup. Tidak bisa membuat transaksi.", 400);
            }
            // 2. Fetch all products and validate stock
            const productIds = items.map((i) => i.productId);
            const products = await tx.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true, sku: true, price: true, stock: true },
            });
            const productMap = new Map(products.map((p) => [p.id, p]));
            let totalPrice = 0;
            const transactionItems = [];
            for (const item of items) {
                const product = productMap.get(item.productId);
                if (!product) {
                    throw new TransactionError(`Produk dengan ID ${item.productId} tidak ditemukan.`, 404);
                }
                if (product.stock < item.quantity) {
                    throw new TransactionError(`Stok "${product.name}" tidak cukup (tersedia: ${product.stock}, diminta: ${item.quantity}).`, 400);
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
            let change = null;
            if (paymentMethod === "CASH") {
                if (!amountPaid || amountPaid < totalPrice) {
                    throw new TransactionError(`Uang bayar kurang. Total: Rp ${totalPrice.toLocaleString("id-ID")}, dibayar: Rp ${(amountPaid !== null && amountPaid !== void 0 ? amountPaid : 0).toLocaleString("id-ID")}.`, 400);
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
                    amountPaid: paymentMethod === "CASH" ? amountPaid : null,
                    change,
                    debitCardNo: paymentMethod === "DEBIT" ? debitCardNo : null,
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
            }
            else {
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
    async getTransactionsByShift(shiftId) {
        const transactions = await prisma_1.prisma.transaction.findMany({
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
    async getDailyTransactions(userId, date) {
        // Determine start and end of the requested day (local time)
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        const transactions = await prisma_1.prisma.transaction.findMany({
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
     * Get aggregated dashboard statistics (total transactions and total items sold) per day
     * within a given date range.
     */
    async getDashboardStats(startDate, endDate) {
        // Determine start and end of the requested range (local time)
        const normalizedStart = new Date(startDate);
        normalizedStart.setHours(0, 0, 0, 0);
        const normalizedEnd = new Date(endDate);
        normalizedEnd.setHours(23, 59, 59, 999);
        const transactions = await prisma_1.prisma.transaction.findMany({
            where: {
                createdAt: {
                    gte: normalizedStart,
                    lte: normalizedEnd,
                },
            },
            select: {
                createdAt: true,
                items: {
                    select: {
                        quantity: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
        // Grouping by date (YYYY-MM-DD)
        const dailyStats = new Map();
        // Helper to get local date string YYYY-MM-DD
        const getLocalYYYYMMDD = (d) => {
            const pad = (n) => n.toString().padStart(2, "0");
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        };
        // Initialize all dates in range with 0 to ensure continuous line chart
        let currentDate = new Date(normalizedStart);
        while (currentDate <= normalizedEnd) {
            const dateString = getLocalYYYYMMDD(currentDate);
            dailyStats.set(dateString, {
                date: dateString,
                totalTransactions: 0,
                totalItemsSold: 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        // Populate data
        for (const tx of transactions) {
            const dateString = getLocalYYYYMMDD(tx.createdAt);
            const stat = dailyStats.get(dateString);
            if (stat) {
                stat.totalTransactions += 1;
                const txItemsCount = tx.items.reduce((sum, item) => sum + item.quantity, 0);
                stat.totalItemsSold += txItemsCount;
            }
        }
        return Array.from(dailyStats.values());
    }
    /**
     * Get the top 5 most sold products within a given date range.
     */
    async getTopProducts(startDate, endDate) {
        const normalizedStart = new Date(startDate);
        normalizedStart.setHours(0, 0, 0, 0);
        const normalizedEnd = new Date(endDate);
        normalizedEnd.setHours(23, 59, 59, 999);
        // Group transaction items by productId
        const topItems = await prisma_1.prisma.transactionItem.groupBy({
            by: ["productId"],
            where: {
                transaction: {
                    createdAt: {
                        gte: normalizedStart,
                        lte: normalizedEnd,
                    },
                },
            },
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: "desc",
                },
            },
            take: 5,
        });
        if (topItems.length === 0)
            return [];
        // Fetch product details for the top items
        const productIds = topItems.map((item) => item.productId);
        const products = await prisma_1.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        return topItems.map((item) => {
            var _a;
            return ({
                productId: item.productId,
                name: ((_a = productMap.get(item.productId)) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Product",
                totalQuantity: item._sum.quantity || 0,
            });
        });
    }
    /**
     * Generate invoice number: INV-YYYYMMDD-XXX
     * Counter resets per day.
     */
    async generateInvoiceNumber(tx) {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
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
            const lastNum = parseInt(lastTransaction.invoiceNumber.replace(prefix, ""), 10);
            if (!isNaN(lastNum)) {
                counter = lastNum + 1;
            }
        }
        return `${prefix}${counter.toString().padStart(3, "0")}`;
    }
}
exports.TransactionService = TransactionService;
// --- Custom error class ---
class TransactionError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "TransactionError";
        this.statusCode = statusCode;
    }
}
exports.TransactionError = TransactionError;
