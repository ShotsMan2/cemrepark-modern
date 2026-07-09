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
