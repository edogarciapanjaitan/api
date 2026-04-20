"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftError = exports.ShiftService = void 0;
const prisma_1 = require("../../lib/prisma");
// --- Service ---
class ShiftService {
    /**
     * Get the currently active (open) shift for a user.
     * Uses indexed query on userId + endTime IS NULL.
     */
    async getActiveShift(userId) {
        const shift = await prisma_1.prisma.shift.findFirst({
            where: {
                userId,
                endTime: null, // Active shift = no end time
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                startingCash: true,
                endingCash: true,
                totalCashSales: true,
                totalDebitSales: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
            orderBy: { startTime: "desc" },
        });
        return shift;
    }
    /**
     * Start a new shift for the user.
     * Enforces: only one active shift per user at a time.
     */
    async startShift(userId, startingCash) {
        // 1. Check for existing active shift
        const existingShift = await prisma_1.prisma.shift.findFirst({
            where: { userId, endTime: null },
            select: { id: true },
        });
        if (existingShift) {
            throw new ShiftError("Anda sudah memiliki shift aktif. Akhiri shift sebelumnya terlebih dahulu.", 409);
        }
        // 2. Create new shift
        const shift = await prisma_1.prisma.shift.create({
            data: {
                userId,
                startingCash,
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                startingCash: true,
                endingCash: true,
                totalCashSales: true,
                totalDebitSales: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });
        return shift;
    }
    /**
     * End the currently active shift for the user.
     * Sets endTime to now and records the ending cash amount.
     */
    async endShift(userId, endingCash) {
        // 1. Find active shift
        const activeShift = await prisma_1.prisma.shift.findFirst({
            where: { userId, endTime: null },
            select: { id: true },
        });
        if (!activeShift) {
            throw new ShiftError("Tidak ada shift aktif yang bisa diakhiri.", 404);
        }
        // 2. Update shift with end data
        const shift = await prisma_1.prisma.shift.update({
            where: { id: activeShift.id },
            data: {
                endTime: new Date(),
                endingCash,
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                startingCash: true,
                endingCash: true,
                totalCashSales: true,
                totalDebitSales: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });
        return shift;
    }
    /**
     * Get daily shift report for the past X days.
     */
    async getDailyShiftReport(days) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0, 0, 0, 0);
        const shifts = await prisma_1.prisma.shift.findMany({
            where: {
                startTime: { gte: startDate }
            },
            include: {
                user: {
                    select: { name: true, username: true }
                },
                transactions: {
                    select: {
                        paymentMethod: true,
                        totalPrice: true
                    }
                },
                _count: {
                    select: { transactions: true }
                }
            },
            orderBy: { startTime: 'desc' }
        });
        return shifts.map((shift) => {
            const calcCash = shift.transactions
                .filter((t) => t.paymentMethod === 'CASH')
                .reduce((sum, t) => sum + t.totalPrice, 0);
            const calcDebit = shift.transactions
                .filter((t) => t.paymentMethod === 'DEBIT')
                .reduce((sum, t) => sum + t.totalPrice, 0);
            return {
                id: shift.id,
                cashierName: shift.user.name,
                startTime: shift.startTime,
                endTime: shift.endTime,
                startingCash: shift.startingCash,
                endingCash: shift.endingCash,
                totalCashSales: calcCash,
                totalDebitSales: calcDebit,
                totalTransactions: shift._count.transactions
            };
        });
    }
}
exports.ShiftService = ShiftService;
// --- Custom error class ---
class ShiftError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "ShiftError";
        this.statusCode = statusCode;
    }
}
exports.ShiftError = ShiftError;
