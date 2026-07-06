import { prisma } from "@/lib/prisma";

class PageService {
  async getPages() {
    return await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async getPageById(id) {
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) },
    });

    if (!page) {
      const error = new Error("Page not found");
      error.statusCode = 404;
      throw error;
    }

    return page;
  }

  async createPage(data) {
    const { title, slug, content } = data;
    return await prisma.page.create({
      data: { title, slug, content },
    });
  }

  async updatePage(id, data) {
    const { title, slug, content } = data;
    return await prisma.page.update({
      where: { id: parseInt(id) },
      data: { title, slug, content },
    });
  }

  async deletePage(id) {
    await prisma.page.delete({
      where: { id: parseInt(id) },
    });

    return { message: "Page deleted successfully" };
  }
}

export const pageService = new PageService();
