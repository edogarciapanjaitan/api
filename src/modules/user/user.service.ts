import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";

export interface UserData {
  id: string;
  name: string;
  username: string;
  role: string;
}

export class UserService {
  /**
   * Get paginated users
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search: string = ""
  ): Promise<{ data: UserData[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (search && search.trim().length > 0) {
      const trimmed = search.trim();
      whereClause.OR = [
        { name: { contains: trimmed, mode: "insensitive" } },
        { username: { contains: trimmed, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return {
      data: users,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a new user (with password hashing)
   */
  async createUser(data: any): Promise<UserData> {
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
      select: { id: true }
    });
    
    if (existing) {
      throw new Error(`Username ${data.username} sudah terdaftar.`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
      },
      select: { id: true, name: true, username: true, role: true },
    });
  }

  /**
   * Update an existing user. Can optionally update password.
   */
  async updateUser(id: string, data: any): Promise<UserData> {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    
    if (!existingUser) {
      throw new Error(`Pengguna tidak ditemukan.`);
    }

    if (data.username && data.username !== existingUser.username) {
      const exists = await prisma.user.findUnique({
        where: { username: data.username },
        select: { id: true }
      });
      if (exists) {
        throw new Error(`Username ${data.username} sudah terdaftar.`);
      }
    }

    const updateData: any = {
      name: data.name,
      username: data.username,
      role: data.role,
    };

    if (data.password && data.password.trim().length > 0) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, username: true, role: true },
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new Error("Pengguna tidak ditemukan.");
    }

    // Protection to prevent deleting the last admin
    if (existingUser.role === "ADMIN") {
       const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
       if (totalAdmins <= 1) {
         throw new Error("Tidak dapat menghapus satu-satunya akun Admin.");
       }
    }

    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new Error("Tidak dapat menghapus pekerja ini karena memiliki riwayat shift/transaksi terkait.");
      }
      throw error;
    }
  }
}
