import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const CACHE_KEY_PRODUCTS = "all_products";
const CACHE_KEY_CATEGORIES = "all_categories";
const CACHE_KEY_BANNERS = "all_banners";
const CACHE_KEY_TREE = "category_tree";

/**
 * @typedef {Object} ProductFilters
 * @property {string} [search]
 * @property {string} [category]
 * @property {number} [minPrice]
 * @property {number} [maxPrice]
 * @property {string} [color]
 * @property {number} [categoryId]
 * @property {string} [fields]
 * @property {boolean} [inStock]
 */

/**
 * @typedef {Object} ProductData
 * @property {string} [ad]
 * @property {number|string} [fiyat]
 * @property {string} [kategori]
 * @property {string} [resim]
 * @property {string} [gorsel]
 * @property {string} [etiket]
 * @property {string} [renk]
 * @property {string} [beden]
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {Array} data
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

class ProductService {
  /**
   * @param {ProductFilters} [filters={}]
   * @returns {Promise<Array>}
   */
  async getProducts(filters = {}) {
    const { search, category, minPrice, maxPrice, color, categoryId, inStock, fields } = filters;
    const hasFilters = search || category || minPrice !== undefined || maxPrice !== undefined || color || categoryId !== undefined || inStock !== undefined;

    if (!hasFilters && !fields) {
      const cached = await cacheGet(CACHE_KEY_PRODUCTS);
      if (cached) return cached;
    }

    try {
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { ad: { contains: search } },
          { etiket: { contains: search } },
        ];
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
        whereClause.renk = color;
      }
      if (inStock !== undefined) {
        whereClause.stok = inStock ? { gt: 0 } : { equals: 0 };
      }

      const selectOptions = fields ? this.parseFields(fields) : undefined;

      const products = await prisma.product.findMany({
        where: whereClause,
        orderBy: { id: "desc" },
        include: selectOptions ? undefined : { variants: true, colors: true, category: true },
        select: selectOptions,
      });

      if (!hasFilters && !fields) {
        await cacheSet(CACHE_KEY_PRODUCTS, products, 300);
      }

      return products;
    } catch (error) {
      logger.error("Failed to fetch products from DB", { error: error.message });
      return [];
    }
  }

  parseFields(fields) {
    const allowed = ["id", "ad", "fiyat", "kategori", "resim", "gorsel", "etiket", "renk", "beden", "stok", "categoryId", "createdAt"];
    const selected = fields.split(",").map(f => f.trim()).filter(f => allowed.includes(f));
    if (selected.length === 0) return undefined;
    const result = {};
    for (const field of selected) {
      result[field] = true;
    }
    return result;
  }

  /**
   * @param {ProductFilters} [filters={}]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {string} [sortBy="id"]
   * @param {string} [sortOrder="desc"]
   * @returns {Promise<PaginatedResult>}
   */
  async getProductsPaginated(filters = {}, page = 1, limit = 10, sortBy = "id", sortOrder = "desc") {
    try {
      const { search, category, minPrice, maxPrice, color, categoryId, inStock } = filters;
      const whereClause = {};

      if (search) {
        whereClause.OR = [
          { ad: { contains: search } },
          { etiket: { contains: search } },
        ];
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
      if (inStock !== undefined) {
        whereClause.stok = inStock ? { gt: 0 } : { equals: 0 };
      }

      const skip = (page - 1) * limit;
      const orderBy = {};
      orderBy[sortBy] = sortOrder;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy,
          include: { variants: true, colors: true, category: true },
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

  async getProductById(id) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        include: { variants: true, colors: true, category: true },
      });
      return product;
    } catch (error) {
      logger.error("Failed to fetch product", { error: error.message, id });
      return null;
    }
  }

  /**
   * @param {ProductData} productData
   * @returns {Promise<Object>}
   */
  async addProduct(productData) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      const { variants, colors, ...data } = productData;
      const newProduct = await prisma.product.create({
        data: {
          ad: data.ad || "",
          fiyat: parseFloat(data.fiyat) || 0,
          kategori: data.kategori || "",
          resim: data.resim || "",
          gorsel: data.gorsel || "",
          etiket: data.etiket || "",
          renk: data.renk || "",
          beden: data.beden || "",
          stok: parseInt(data.stok) || 0,
          categoryId: data.categoryId ? parseInt(data.categoryId) : null,
          ...(variants && variants.length > 0 ? {
            variants: {
              create: variants.map(v => ({
                sku: v.sku || null,
                color: v.color || null,
                size: v.size || null,
                stock: v.stock || 0,
                price: v.price || null,
              })),
            },
          } : {}),
          ...(colors && colors.length > 0 ? {
            colors: {
              create: colors.map(c => ({
                renkAdi: c.renkAdi,
                gorselUrl: c.gorselUrl,
              })),
            },
          } : {}),
        },
        include: { variants: true, colors: true, category: true },
      });
      return newProduct;
    } catch (dbErr) {
      logger.error("DB product create error:", { error: dbErr.message, stack: dbErr.stack });
      throw new Error("Ürün eklenemedi");
    }
  }

  /**
   * @param {number|string} id
   * @param {ProductData} productData
   * @returns {Promise<Object>}
   */
  async updateProduct(id, productData) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      const { variants, colors, ...data } = productData;
      const updateData = {};
      if (data.ad !== undefined) updateData.ad = data.ad;
      if (data.fiyat !== undefined) updateData.fiyat = parseFloat(data.fiyat);
      if (data.kategori !== undefined) updateData.kategori = data.kategori;
      if (data.resim !== undefined) updateData.resim = data.resim;
      if (data.gorsel !== undefined) updateData.gorsel = data.gorsel;
      if (data.etiket !== undefined) updateData.etiket = data.etiket;
      if (data.renk !== undefined) updateData.renk = data.renk;
      if (data.beden !== undefined) updateData.beden = data.beden;
      if (data.stok !== undefined) updateData.stok = parseInt(data.stok);
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ? parseInt(data.categoryId) : null;

      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: { variants: true, colors: true, category: true },
      });
      return updatedProduct;
    } catch (dbErr) {
      logger.error("DB product update error:", { error: dbErr.message, stack: dbErr.stack });
      const error = new Error("Ürün güncellenemedi veya bulunamadı");
      error.statusCode = 404;
      throw error;
    }
  }

  /**
   * @param {number|string} id
   * @returns {Promise<{success: boolean}>}
   */
  async deleteProduct(id) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      await prisma.review.deleteMany({ where: { productId: parseInt(id) } });
      await prisma.product.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch (dbErr) {
      logger.error("DB product DELETE error:", { error: dbErr.message, stack: dbErr.stack });
      const error = new Error("Ürün silinemedi veya bulunamadı");
      error.statusCode = 404;
      throw error;
    }
  }

  async deleteMany(ids) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      await prisma.review.deleteMany({ where: { productId: { in: ids } } });
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
      return { success: true, deletedCount: ids.length };
    } catch (dbErr) {
      logger.error("DB bulk delete error:", { error: dbErr.message });
      throw new Error("Toplu silme işlemi başarısız");
    }
  }

  async updateMany(ids, updateData) {
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      const data = {};
      if (updateData.kategori !== undefined) data.kategori = updateData.kategori;
      if (updateData.categoryId !== undefined) data.categoryId = updateData.categoryId ? parseInt(updateData.categoryId) : null;
      if (updateData.etiket !== undefined) data.etiket = updateData.etiket;

      const result = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data,
      });
      return { success: true, updatedCount: result.count };
    } catch (dbErr) {
      logger.error("DB bulk update error:", { error: dbErr.message });
      throw new Error("Toplu güncelleme işlemi başarısız");
    }
  }

  async updateStock(id, quantity) {
    await cacheDel(CACHE_KEY_PRODUCTS);

    try {
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { stok: { increment: quantity } },
      });
      return product;
    } catch (dbErr) {
      logger.error("DB stock update error:", { error: dbErr.message });
      throw new Error("Stok güncellenemedi");
    }
  }

  async setStock(id, quantity) {
    await cacheDel(CACHE_KEY_PRODUCTS);

    try {
      const product = await prisma.product.update({
        where: { id: parseInt(id) },
        data: { stok: Math.max(0, parseInt(quantity)) },
      });
      return product;
    } catch (dbErr) {
      logger.error("DB stock set error:", { error: dbErr.message });
      throw new Error("Stok ayarlanamadı");
    }
  }

  async addVariant(productId, variantData) {
    await cacheDel(CACHE_KEY_PRODUCTS);

    try {
      const variant = await prisma.productVariant.create({
        data: {
          productId: parseInt(productId),
          sku: variantData.sku || null,
          color: variantData.color || null,
          size: variantData.size || null,
          stock: variantData.stock || 0,
          price: variantData.price || null,
        },
      });
      return variant;
    } catch (dbErr) {
      logger.error("DB variant create error:", { error: dbErr.message });
      throw new Error("Varyant eklenemedi");
    }
  }

  async updateVariant(variantId, variantData) {
    await cacheDel(CACHE_KEY_PRODUCTS);

    try {
      const data = {};
      if (variantData.sku !== undefined) data.sku = variantData.sku;
      if (variantData.color !== undefined) data.color = variantData.color;
      if (variantData.size !== undefined) data.size = variantData.size;
      if (variantData.stock !== undefined) data.stock = variantData.stock;
      if (variantData.price !== undefined) data.price = variantData.price;

      const variant = await prisma.productVariant.update({
        where: { id: parseInt(variantId) },
        data,
      });
      return variant;
    } catch (dbErr) {
      logger.error("DB variant update error:", { error: dbErr.message });
      throw new Error("Varyant güncellenemedi");
    }
  }

  async deleteVariant(variantId) {
    await cacheDel(CACHE_KEY_PRODUCTS);

    try {
      await prisma.productVariant.delete({ where: { id: parseInt(variantId) } });
      return { success: true };
    } catch (dbErr) {
      logger.error("DB variant delete error:", { error: dbErr.message });
      throw new Error("Varyant silinemedi");
    }
  }

  async searchProducts(query, limit = 20) {
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { ad: { contains: query } },
            { etiket: { contains: query } },
            { kategori: { contains: query } },
          ],
        },
        take: limit,
        orderBy: { id: "desc" },
        include: { variants: true, colors: true, category: true },
      });

      return products.map(p => ({
        ...p,
        relevance: this.calculateRelevance(p, query),
      })).sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      logger.error("DB search error:", { error: error.message });
      return [];
    }
  }

  calculateRelevance(product, query) {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const lowerName = (product.ad || "").toLowerCase();
    const lowerTags = (product.etiket || "").toLowerCase();
    const lowerCategory = (product.kategori || "").toLowerCase();

    if (lowerName === lowerQuery) score += 100;
    if (lowerName.startsWith(lowerQuery)) score += 50;
    if (lowerName.includes(lowerQuery)) score += 30;
    if (lowerTags.includes(lowerQuery)) score += 20;
    if (lowerCategory.includes(lowerQuery)) score += 10;

    return score;
  }

  async getRelatedProducts(productId, limit = 6) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
        select: { kategori: true, categoryId: true, etiket: true },
      });

      if (!product) return [];

      const whereClause = {
        id: { not: parseInt(productId) },
        OR: [
          { kategori: product.kategori },
          { etiket: product.etiket },
        ],
      };

      const related = await prisma.product.findMany({
        where: whereClause,
        take: limit,
        orderBy: { id: "desc" },
        include: { variants: true, colors: true, category: true },
      });

      return related;
    } catch (error) {
      logger.error("DB related products error:", { error: error.message });
      return [];
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

  async getCategoryTree() {
    const cached = await cacheGet(CACHE_KEY_TREE);
    if (cached) return cached;

    try {
      const categories = await prisma.category.findMany({
        include: { children: true },
      });

      const tree = categories.filter(c => c.parentId === null).map(c => ({
        ...c,
        children: categories.filter(child => child.parentId === c.id),
      }));

      await cacheSet(CACHE_KEY_TREE, tree, 600);
      return tree;
    } catch (dbErr) {
      logger.error("DB getCategoryTree error:", { error: dbErr.message });
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
