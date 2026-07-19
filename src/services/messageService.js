import prisma from "@/lib/prisma";

class MessageService {
  async getMessages() {
    const messages = await prisma.message.findMany({
      orderBy: { id: "desc" },
    });

    return messages.map((m) => ({
      ...m,
      ePosta: m.email,
    }));
  }

  async getMessagesPaginated(filters = {}, page = 1, limit = 10, sortBy = "id", sortOrder = "desc") {
    try {
      const { search } = filters;
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { adSoyad: { contains: search } },
          { email: { contains: search } },
          { mesaj: { contains: search } }
        ];
      }

      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.message.count({ where: whereClause })
      ]);

      const mappedData = messages.map((m) => ({
        ...m,
        ePosta: m.email,
      }));

      return {
        data: mappedData,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error("Failed to fetch paginated messages from DB", { error: error.message });
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async createMessage(data) {
    const { adSoyad, ePosta, email, telefon, mesaj } = data;
    const userEmail = ePosta || email;

    if (!adSoyad || !userEmail || !mesaj) {
      const error = new Error("Lütfen tüm alanları doldurun");
      error.statusCode = 400;
      throw error;
    }

    const newMessage = await prisma.message.create({
      data: {
        adSoyad,
        email: userEmail,
        telefon: telefon || null,
        mesaj,
        tarih: new Date().toLocaleString("tr-TR"),
      },
    });

    return {
      ...newMessage,
      ePosta: newMessage.email,
    };
  }

  async deleteMessage(id) {
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMessage) {
      const error = new Error("Mesaj bulunamadı");
      error.statusCode = 404;
      throw error;
    }

    await prisma.message.delete({
      where: { id: parseInt(id) },
    });

    return { success: true };
  }
}

export const messageService = new MessageService();
