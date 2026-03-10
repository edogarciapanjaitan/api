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
        { name: 'Aqua Botol 600ml', sku: 'AQUA600', price: 3500, stock: 100, category: 'Minuman' },
        { name: 'Teh Pucuk Harum 350ml', sku: 'TEHPCK', price: 4000, stock: 50, category: 'Minuman' },
        { name: 'Indomilk Steril Cokelat', sku: 'IDMLKCKL', price: 10500, stock: 24, category: 'Minuman' },
        { name: 'Coca Cola 390ml', sku: 'COKE390', price: 6000, stock: 30, category: 'Minuman' },
        { name: 'Pocari Sweat 500ml', sku: 'POCARI', price: 8500, stock: 40, category: 'Minuman' },

        // MAKANAN & SNACK
        { name: 'Indomie Goreng Spesial', sku: 'INDGORENG', price: 3100, stock: 200, category: 'Makanan' },
        { name: 'Sedaap Mie Kuah Soto', sku: 'SEDAPSOTO', price: 3000, stock: 150, category: 'Makanan' },
        { name: 'Chitato Sapi Panggang', sku: 'CHITATO', price: 11500, stock: 20, category: 'Snack' },
        { name: 'Silverqueen Cashew 58g', sku: 'SQ58G', price: 16500, stock: 15, category: 'Snack' },
        { name: 'Oreo Vanilla 133g', sku: 'OREO133', price: 9500, stock: 25, category: 'Snack' },

        // KEBUTUHAN DAPUR
        { name: 'Minyak Goreng Bimoli 1L', sku: 'BIMOLI1L', price: 18500, stock: 12, category: 'Dapur' },
        { name: 'Gula Pasir Gulaku 1kg', sku: 'GULAKU1K', price: 17000, stock: 20, category: 'Dapur' },
        { name: 'Kecap Manis Bango 550ml', sku: 'BANGO550', price: 24500, stock: 10, category: 'Dapur' },
        { name: 'Beras Pandan Wangi 5kg', sku: 'BERAS5K', price: 75000, stock: 5, category: 'Dapur' },

        // PERSONAL CARE & HOUSEHOLD
        { name: 'Pepsodent White 190g', sku: 'PEPSO190', price: 14500, stock: 30, category: 'Personal Care' },
        { name: 'Lifebuoy Sabun Cair 400ml', sku: 'LIFEB400', price: 22000, stock: 20, category: 'Personal Care' },
        { name: 'Sunsilk Black 170ml', sku: 'SUNSLK170', price: 26000, stock: 15, category: 'Personal Care' },
        { name: 'Mama Lemon Jeruk Nipis', sku: 'MAMALMN', price: 13500, stock: 25, category: 'Rumah Tangga' },
        { name: 'Rinso Molto 770g', sku: 'RINSO770', price: 28500, stock: 18, category: 'Rumah Tangga' },
        { name: 'Tisu Paseo 250 Sheets', sku: 'PASEO250', price: 15000, stock: 40, category: 'Rumah Tangga' },
    ];

    await prisma.product.createMany({ data: products });

    console.log('Seeding berhasil! 20 produk telah ditambahkan.');
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