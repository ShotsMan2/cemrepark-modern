import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import redis, { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const CACHE_KEY_PRODUCTS = "all_products";
const CACHE_KEY_CATEGORIES = "all_categories";
const CACHE_KEY_BANNERS = "all_banners";

class ProductService {
  async getProducts(filters = {}) {
    const { search, category, minPrice, maxPrice, color, categoryId } = filters;
    const hasFilters =
      search ||
      category ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      color ||
      categoryId !== undefined;

    // Only use the static cache if there are no filters
    if (!hasFilters) {
      const cached = await cacheGet(CACHE_KEY_PRODUCTS);
      if (cached) return cached;
    }

    try {
      const whereClause = {};

      if (search) {
        whereClause.ad = { contains: search }; // Note: case insensitive is default in Prisma with some DBs, or you'd use mode: 'insensitive' in Postgres. SQLite doesn't support mode: 'insensitive' easily, so we just use contains.
      }
      if (category) {
        whereClause.kategori = category;
      }
      if (categoryId !== undefined) {
        whereClause.categoryId = categoryId;
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.fiyat = {};
        if (minPrice !== undefined) whereClause.fiyat.gte = minPrice;
        if (maxPrice !== undefined) whereClause.fiyat.lte = maxPrice;
      }
      if (color) {
        whereClause.renk = color; // Also could check variants in future: variants: { some: { color } }
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { id: "desc" },
        include: {
          variants: true,
          colors: true,
          category: true,
        },
      });

      if (!hasFilters) {
        await cacheSet(CACHE_KEY_PRODUCTS, products, 300);
      }

      return products;
    } catch (error) {
      logger.error("Failed to fetch products from DB", { error: error.message });
      return [];
    }
  }

  async getProductsPaginated(
    filters = {},
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "desc"
  ) {
    try {
      const { search, category, minPrice, maxPrice, color, categoryId } = filters;
      const whereClause = {};

      if (search) {
        whereClause.ad = { contains: search };
      }
      if (category && category !== "all") {
        whereClause.kategori = category;
      }
      if (categoryId !== undefined) {
        whereClause.categoryId = categoryId;
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.fiyat = {};
        if (minPrice !== undefined) whereClause.fiyat.gte = minPrice;
        if (maxPrice !== undefined) whereClause.fiyat.lte = maxPrice;
      }
      if (color) {
        whereClause.renk = color;
      }

      const skip = (page - 1) * limit;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            variants: true,
            colors: true,
            category: true,
          },
        }),
        prisma.product.count({ where: whereClause }),
      ]);

      return {
        data: products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Failed to fetch paginated products from DB", { error: error.message });
      return { data: [], total: 0, page, limit, totalPages: 0 };
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
