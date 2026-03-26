import { PrismaClient } from "@prisma/client";



const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = (globalForPrisma.prisma ?? new PrismaClient())
  .$extends({
    query: {
      user: {
        async create({ args, query }) {
          // Contoh: Logic sebelum create user
          return query(args);
        },
      },
    },
  });