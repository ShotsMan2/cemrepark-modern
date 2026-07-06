import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

class UserService {
  async getUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async registerUser(email, password, name, ip) {
    if (!email || !password) {
      const error = new Error("Email ve şifre zorunludur.");
      error.statusCode = 400;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error("Şifre en az 6 karakter olmalıdır.");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error("Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: "user",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: newUser.id,
        action: "USER_REGISTERED",
        details: "Kullanıcı credentials ile kayıt oldu.",
        ipAddress: ip,
      },
    });

    return {
      message: "Kayıt işlemi başarılı.",
      user: { id: newUser.id, email: newUser.email, name: newUser.name },
    };
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id: parseInt(id) }
    });
  }
}

export const userService = new UserService();
