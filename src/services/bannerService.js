import { prisma } from "@/lib/prisma";

class BannerService {
  async getBanners() {
    return await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
  }

  async getBannerById(id) {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!banner) {
      const error = new Error("Banner not found");
      error.statusCode = 404;
      throw error;
    }

    return banner;
  }

  async createBanner(data) {
    const { title, imageUrl, linkUrl, isActive, order } = data;
    return await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive: isActive ?? true,
        order: parseInt(order) || 0,
      },
    });
  }

  async updateBanner(id, data) {
    const { title, imageUrl, linkUrl, isActive, order } = data;
    return await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive,
        order: parseInt(order),
      },
    });
  }

  async deleteBanner(id) {
    const existingBanner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingBanner) {
      const error = new Error("Banner bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    await prisma.banner.delete({
      where: { id: parseInt(id) },
    });

    return { message: "Banner deleted successfully" };
  }
}

export const bannerService = new BannerService();
