import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("Membuat akun Admin untuk produksi...");
    
    const username = 'admin';
    const plainPassword = 'admin123';
    
    // Cek apakah admin sudah ada
    const existingAdmin = await prisma.user.findUnique({
        where: { username }
    });

    if (existingAdmin) {
        console.log(`Akun dengan username '${username}' sudah ada di database.`);
        console.log("Jika tidak bisa login, kemungkinan passwordnya berbeda atau ada masalah lain.");
        return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    await prisma.user.create({
        data: {
            name: 'Administrator',
            username: username,
            password: hashedPassword,
            role: Role.ADMIN,
        },
    });
    
    console.log("✅ Akun Admin berhasil dibuat!");
    console.log(`Username : ${username}`);
    console.log(`Password : ${plainPassword}`);
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
