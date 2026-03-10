import { prisma } from "../../lib/prisma";

// --- Types ---

interface ShiftData {
  id: string;
  startTime: Date;
  endTime: Date | null;
  startingCash: number;
  endingCash: number | null;
  totalCashSales: number;
  totalDebitSales: number;
  user: {
    id: string;
    name: string;
    username: string;
  };
}

// --- Service ---

export class ShiftService {
  /**
   * Get the currently active (open) shift for a user.
   * Uses indexed query on userId + endTime IS NULL.
   */
  async getActiveShift(userId: string): Promise<ShiftData | null> {
    const shift = await prisma.shift.findFirst({
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
  async startShift(userId: string, startingCash: number): Promise<ShiftData> {
    // 1. Check for existing active shift
    const existingShift = await prisma.shift.findFirst({
      where: { userId, endTime: null },
      select: { id: true },
    });

    if (existingShift) {
      throw new ShiftError(
        "Anda sudah memiliki shift aktif. Akhiri shift sebelumnya terlebih dahulu.",
        409
      );
    }

    // 2. Create new shift
    const shift = await prisma.shift.create({
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
  async endShift(userId: string, endingCash: number): Promise<ShiftData> {
    // 1. Find active shift
    const activeShift = await prisma.shift.findFirst({
      where: { userId, endTime: null },
      select: { id: true },
    });

    if (!activeShift) {
      throw new ShiftError("Tidak ada shift aktif yang bisa diakhiri.", 404);
    }

    // 2. Update shift with end data
    const shift = await prisma.shift.update({
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
}

// --- Custom error class ---

export class ShiftError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ShiftError";
    this.statusCode = statusCode;
  }
}
