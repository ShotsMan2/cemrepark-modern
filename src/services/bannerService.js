import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const CACHE_KEY_BANNERS = "all_banners";

class BannerService {
  async getBanners() {
    const cached = await cacheGet(CACHE_KEY_BANNERS);
    if (cached) return cached;

    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });

    await cacheSet(CACHE_KEY_BANNERS, banners, 600); // 10 mins cache
    return banners;
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
    const newBanner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive: isActive ?? true,
        order: parseInt(order) || 0,
      },
    });

    await cacheDel(CACHE_KEY_BANNERS);
    return newBanner;
  }

  async updateBanner(id, data) {
    const { title, imageUrl, linkUrl, isActive, order } = data;
    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        title,
        imageUrl,
        linkUrl,
        isActive,
        order: parseInt(order),
      },
    });

    await cacheDel(CACHE_KEY_BANNERS);
    return updatedBanner;
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

    await cacheDel(CACHE_KEY_BANNERS);
    return { message: "Banner deleted successfully" };
  }
}

export const bannerService = new BannerService();
