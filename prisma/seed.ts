import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // 1. Enkripsi Password
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedCashierPassword = await bcrypt.hash('kasir123', 10);

    // 2. Bersihkan Database Lama
    console.log('Membersihkan data lama...');
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // 3. Tambahkan User
    await prisma.user.create({
        data: {
            name: 'Manager Toko',
            username: 'admin',
            password: hashedAdminPassword,
            role: Role.ADMIN,
        },
    });

    await prisma.user.create({
        data: {
            name: 'Siti Kasir',
            username: 'kasir1',
            password: hashedCashierPassword,
            role: Role.CASHIER,
        },
    });

    // 4. Tambahkan 20 Item Minimarket Variatif
    console.log('Menambahkan 20 produk minimarket...');
    const products = [
        // MINUMAN
        { name: 'Aqua Botol 600ml', sku: '1001', price: 3500, stock: 100, category: 'Minuman' },
        { name: 'Teh Pucuk Harum 350ml', sku: '1002', price: 4000, stock: 50, category: 'Minuman' },
        { name: 'Indomilk Steril Cokelat', sku: '1003', price: 10500, stock: 24, category: 'Minuman' },
        { name: 'Coca Cola 390ml', sku: '1004', price: 6000, stock: 30, category: 'Minuman' },
        { name: 'Pocari Sweat 500ml', sku: '1005', price: 8500, stock: 40, category: 'Minuman' },

        // MAKANAN & SNACK
        { name: 'Indomie Goreng Spesial', sku: '2001', price: 3100, stock: 200, category: 'Makanan' },
        { name: 'Sedaap Mie Kuah Soto', sku: '2002', price: 3000, stock: 150, category: 'Makanan' },
        { name: 'Chitato Sapi Panggang', sku: '2003', price: 11500, stock: 20, category: 'Snack' },
        { name: 'Silverqueen Cashew 58g', sku: '2004', price: 16500, stock: 15, category: 'Snack' },
        { name: 'Oreo Vanilla 133g', sku: '2005', price: 9500, stock: 25, category: 'Snack' },

        // KEBUTUHAN DAPUR
        { name: 'Minyak Goreng Bimoli 1L', sku: '3001', price: 18500, stock: 12, category: 'Dapur' },
        { name: 'Gula Pasir Gulaku 1kg', sku: '3002', price: 17000, stock: 20, category: 'Dapur' },
        { name: 'Kecap Manis Bango 550ml', sku: '3003', price: 24500, stock: 10, category: 'Dapur' },
        { name: 'Beras Pandan Wangi 5kg', sku: '3004', price: 75000, stock: 5, category: 'Dapur' },

        // PERSONAL CARE & HOUSEHOLD
        { name: 'Pepsodent White 190g', sku: '4001', price: 14500, stock: 30, category: 'Personal Care' },
        { name: 'Lifebuoy Sabun Cair 400ml', sku: '4002', price: 22000, stock: 20, category: 'Personal Care' },
        { name: 'Sunsilk Black 170ml', sku: '4003', price: 26000, stock: 15, category: 'Personal Care' },
        { name: 'Mama Lemon Jeruk Nipis', sku: '4004', price: 13500, stock: 25, category: 'Rumah Tangga' },
        { name: 'Rinso Molto 770g', sku: '4005', price: 28500, stock: 18, category: 'Rumah Tangga' },
        { name: 'Tisu Paseo 250 Sheets', sku: '4006', price: 15000, stock: 40, category: 'Rumah Tangga' },
    ];

    await prisma.product.createMany({ data: products });

    // 5. Tambahkan Riwayat Transaksi 7 Hari Terakhir
    console.log('Membuat data transaksi rekayasa selama 7 hari terakhir...');
    const allProducts = await prisma.product.findMany();
    const cashier = await prisma.user.findUnique({ where: { username: 'kasir1' } });

    if (cashier && allProducts.length > 0) {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            // Buat Shift
            const startTime = new Date(date);
            startTime.setHours(8, 0, 0, 0); // Buka 08:00
            
            const endTime = new Date(date);
            endTime.setHours(17, 0, 0, 0); // Tutup 17:00

            const shift = await prisma.shift.create({
                data: {
                    userId: cashier.id,
                    startTime,
                    endTime,
                    startingCash: 500000,
                    endingCash: 500000, // Akan diupdate nanti
                    totalCashSales: 0,
                    totalDebitSales: 0
                }
            });

            const txCount = Math.floor(Math.random() * 10) + 5; // 5-14 transaksi per hari
            let totalCash = 0;
            let totalDebit = 0;

            for (let j = 0; j < txCount; j++) {
                const txTime = new Date(startTime);
                txTime.setMinutes(txTime.getMinutes() + Math.floor(Math.random() * 500)); // Acak jam transaksi

                const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 produk berbeda
                const itemsMap = new Map(); // Untuk mencegah duplicate produk dalam 1 trx
                let totalPrice = 0;

                for (let k = 0; k < itemCount; k++) {
                    const product = allProducts[Math.floor(Math.random() * allProducts.length)];
                    const quantity = Math.floor(Math.random() * 2) + 1;
                    if (!itemsMap.has(product.id)) {
                        const subtotal = product.price * quantity;
                        totalPrice += subtotal;
                        itemsMap.set(product.id, {
                            productId: product.id,
                            quantity,
                            priceAtSale: product.price,
                            subtotal
                        });
                    }
                }

                const isDebit = Math.random() > 0.7; // 30% pakai debit
                const invoiceDateStr = txTime.getFullYear().toString() + (txTime.getMonth() + 1).toString().padStart(2, '0') + txTime.getDate().toString().padStart(2, '0');
                const invoiceStr = `INV-${invoiceDateStr}-${(j+1).toString().padStart(3, '0')}`;

                if (isDebit) totalDebit += totalPrice; else totalCash += totalPrice;

                await prisma.transaction.create({
                    data: {
                        invoiceNumber: invoiceStr,
                        shiftId: shift.id,
                        totalPrice,
                        paymentMethod: isDebit ? 'DEBIT' : 'CASH',
                        amountPaid: isDebit ? null : totalPrice + 10000, // asumsikan kembalian
                        change: isDebit ? null : 10000,
                        debitCardNo: isDebit ? '**** **** **** 1234' : null,
                        createdAt: txTime,
                        items: {
                            create: Array.from(itemsMap.values())
                        }
                    }
                });
            }

            // Update shift dengan total penjualan aktual
            await prisma.shift.update({
                where: { id: shift.id },
                data: {
                    totalCashSales: totalCash,
                    totalDebitSales: totalDebit,
                    endingCash: 500000 + totalCash
                }
            });
        }
    }

    console.log('Seeding berhasil! 20 produk dan riwayat transaksi 7 hari telah ditambahkan.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });