import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import redis, { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const CACHE_KEY_PRODUCTS = "all_products";
const CACHE_KEY_CATEGORIES = "all_categories";
const CACHE_KEY_BANNERS = "all_banners";

class ProductService {
  async getProducts() {
    const cached = await cacheGet(CACHE_KEY_PRODUCTS);
    if (cached) return cached;

    try {
      const products = await prisma.product.findMany({
        orderBy: { id: "desc" }
      });
      await cacheSet(CACHE_KEY_PRODUCTS, products, 300);
      return products;
    } catch (error) {
      logger.error("Failed to fetch products from DB", { error: error.message });
      return [];
    }
  }

  async addProduct(productData) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      const newProduct = await prisma.product.create({
        data: {
          ad: productData.ad || "",
          fiyat: parseFloat(productData.fiyat) || 0,
          kategori: productData.kategori || "",
          resim: productData.resim || "",
          gorsel: productData.gorsel || "",
          etiket: productData.etiket || "",
          renk: productData.renk || "",
          beden: productData.beden || "",
        },
      });
      return newProduct;
    } catch (dbErr) {
      logger.error("DB product create error:", { error: dbErr.message, stack: dbErr.stack });
      throw new Error("Ürün eklenemedi");
    }
  }

  async updateProduct(id, productData) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          ad: productData.ad || "",
          fiyat: parseFloat(productData.fiyat) || 0,
          kategori: productData.kategori || "",
          resim: productData.resim || "",
          gorsel: productData.gorsel || "",
          etiket: productData.etiket || "",
          renk: productData.renk || "",
          beden: productData.beden || "",
        },
      });
      return updatedProduct;
    } catch (dbErr) {
      logger.error("DB product update error:", { error: dbErr.message, stack: dbErr.stack });
      const error = new Error("Ürün güncellenemedi veya bulunamadı");
      error.statusCode = 404;
      throw error;
    }
  }

  async deleteProduct(id) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      await prisma.review.deleteMany({ where: { productId: parseInt(id) } });
      await prisma.product.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch (dbErr) {
      logger.error("DB product DELETE sync error:", { error: dbErr.message, stack: dbErr.stack });
      const error = new Error("Ürün silinemedi veya bulunamadı");
      error.statusCode = 404;
      throw error;
    }
  }

  async getCategories() {
    const cached = await cacheGet(CACHE_KEY_CATEGORIES);
    if (cached) return cached;

    try {
      const categories = await prisma.category.findMany();
      await cacheSet(CACHE_KEY_CATEGORIES, categories, 600);
      return categories;
    } catch (dbErr) {
      logger.error("DB getCategories error:", { error: dbErr.message });
      return [];
    }
  }

  async getBanners() {
    const cached = await cacheGet(CACHE_KEY_BANNERS);
    if (cached) return cached;

    try {
      const banners = await prisma.banner.findMany({
        orderBy: { order: "asc" },
      });
      await cacheSet(CACHE_KEY_BANNERS, banners, 600);
      return banners;
    } catch (dbErr) {
      logger.error("DB getBanners error:", { error: dbErr.message });
      return [];
    }
  }
}

export const productService = new ProductService();
