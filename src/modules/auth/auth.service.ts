import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { config } from "../../config/config";

interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    username: string;
    role: string;
  };
}


export class AuthService {

  async login(username: string, password: string): Promise<LoginResult> {
    // 1. Find user — select only needed fields (efficient query)
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      throw new AuthError("Username atau password salah", 401);
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthError("Username atau password salah", 401);
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    // 4. Return token + safe user data (no password)
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    };
  }
}

// --- Custom error class ---

export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
