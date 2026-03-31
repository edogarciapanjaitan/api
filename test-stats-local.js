const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const endDate = new Date(); // 2026-03-31
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6); // 2026-03-25
  
  const normalizedStart = new Date(startDate);
  normalizedStart.setHours(0, 0, 0, 0);

  const normalizedEnd = new Date(endDate);
  normalizedEnd.setHours(23, 59, 59, 999);

  const toLocalDateString = (d) => {
    const pad = (n) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const dailyStats = new Map();
  let currentDate = new Date(normalizedStart);
  while (currentDate <= normalizedEnd) {
    const dateString = toLocalDateString(currentDate);
    dailyStats.set(dateString, { date: dateString });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log('map keys (local):', Array.from(dailyStats.keys()));

  const txs = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: normalizedStart,
        lte: normalizedEnd,
      },
    },
    select: { createdAt: true }
  });

  const txDates = txs.map(tx => toLocalDateString(tx.createdAt));
  console.log('transaction dates (local):', txDates);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
