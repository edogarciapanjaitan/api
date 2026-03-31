import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFetch() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) return console.log('No admin found');

  const token = jwt.sign(
    { userId: admin.id, role: admin.role },
    process.env.JWT_SECRET || 'supersecret_key_123',
    { expiresIn: '1d' }
  );

  console.log("Token:", token);

  const res1 = await fetch('http://localhost:3001/api/transactions/dashboard-stats?days=7', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("Stats Response:", res1.status, await res1.text());

  const res2 = await fetch('http://localhost:3001/api/shifts/daily-report?days=7', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("Shift Response:", res2.status, await res2.text());
}

testFetch().catch(console.error).finally(() => prisma.$disconnect());
