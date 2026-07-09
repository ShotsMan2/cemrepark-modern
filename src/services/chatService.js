import prisma from "@/lib/prisma";

class ChatService {
  async getConversation(id) {
    return prisma.chatConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async createConversation(data) {
    return prisma.chatConversation.create({ data });
  }

  async getMessages(conversationId) {
    return prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async createMessage(conversationId, role, content, status = "completed") {
    return prisma.chatMessage.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        role,
        content,
        status,
      },
    });
  }
}

export const chatService = new ChatService();
