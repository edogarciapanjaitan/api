import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 * Prevents multiple instances during development (hot-reload).
 * Caches the connection across requests for efficiency.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
