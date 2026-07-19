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
    });
  }

  async getUsersPaginated(filters = {}, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc") {
    try {
      const { search, role } = filters;
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { name: { contains: search } },
          { email: { contains: search } }
        ];
      }

      if (role && role !== 'all') {
        whereClause.role = role;
      }

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
              select: { orders: true, reviews: true },
            },
          }
        }),
        prisma.user.count({ where: whereClause })
      ]);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Failed to fetch paginated users from DB", { error: error.message });
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async registerUser(email, password, name, ip) {
    if (!email || !password) {
      const error = new Error("Email ve şifre zorunludur.");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    if (password.length < 6) {
      const error = new Error("Şifre en az 6 karakter olmalıdır.");
      error.statusCode = 400;
      error.isOperational = true;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error("Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var.");
      error.statusCode = 409;
      error.isOperational = true;
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

  async updateProfile(userId, data) {
    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;

    if (data.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser && existingUser.id !== userId) {
        const error = new Error("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");
        error.statusCode = 409;
        error.isOperational = true;
        throw error;
      }
      updateData.email = data.email;
    }

    if (data.password) {
      if (data.password.length < 6) {
        const error = new Error("Şifre en az 6 karakter olmalıdır.");
        error.statusCode = 400;
        error.isOperational = true;
        throw error;
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
    });

    return {
      message: "Profil başarıyla güncellendi.",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber
      }
    };
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id: parseInt(id) }
    });
  }
}

export const userService = new UserService();
