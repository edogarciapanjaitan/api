import { PrismaClient } from '@prisma/client';
import { TransactionService } from './src/modules/transaction/transaction.service';
import { ShiftService } from './src/modules/shift/shift.service';

const prisma = new PrismaClient();
const txSvc = new TransactionService();
const shSvc = new ShiftService();

async function main() {
    const days = 7;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    
    console.log("=== Transactions Dashboard Stats ===");
    const stats = await txSvc.getDashboardStats(startDate, endDate);
    console.log(JSON.stringify(stats, null, 2));

    console.log("\n=== Daily Shift Report ===");
    const shifts = await shSvc.getDailyShiftReport(days);
    console.log(JSON.stringify(shifts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
