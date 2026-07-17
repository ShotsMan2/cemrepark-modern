import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const CACHE_KEY_PAGES = "all_pages";

class PageService {
  async getPages() {
    const cached = await cacheGet(CACHE_KEY_PAGES);
    if (cached) return cached;

    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });

    await cacheSet(CACHE_KEY_PAGES, pages, 600); // Cache for 10 minutes
    return pages;
  }

  async getPageById(id) {
    const cacheKey = `page_${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) },
    });

    if (!page) {
      const error = new Error("Page not found");
      error.statusCode = 404;
      throw error;
    }

    await cacheSet(cacheKey, page, 600);
    return page;
  }

  async createPage(data) {
    const { title, slug, content } = data;
    const page = await prisma.page.create({
      data: { title, slug, content },
    });
    await cacheDel(CACHE_KEY_PAGES);
    return page;
  }

  async updatePage(id, data) {
    const { title, slug, content } = data;
    const page = await prisma.page.update({
      where: { id: parseInt(id) },
      data: { title, slug, content },
    });
    await cacheDel(CACHE_KEY_PAGES);
    await cacheDel(`page_${id}`);
    return page;
  }

  async deletePage(id) {
    await prisma.page.delete({
      where: { id: parseInt(id) },
    });
    await cacheDel(CACHE_KEY_PAGES);
    await cacheDel(`page_${id}`);
    return { message: "Page deleted successfully" };
  }
}

export const pageService = new PageService();
