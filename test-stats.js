const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  
  const normalizedStart = new Date(startDate);
  normalizedStart.setHours(0, 0, 0, 0);

  const normalizedEnd = new Date(endDate);
  normalizedEnd.setHours(23, 59, 59, 999);

  console.log('startDate:', startDate);
  console.log('endDate:', endDate);
  console.log('normalizedStart (loc):', normalizedStart);
  console.log('normalizedEnd (loc):', normalizedEnd);

  const txs = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: normalizedStart,
        lte: normalizedEnd,
      },
    },
    select: { createdAt: true }
  });
  console.log('transactions found:', txs.length);

  const dailyStats = new Map();
  let currentDate = new Date(normalizedStart);
  while (currentDate <= normalizedEnd) {
    const dateString = currentDate.toISOString().split("T")[0];
    dailyStats.set(dateString, { date: dateString });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log('map keys:', Array.from(dailyStats.keys()));
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
