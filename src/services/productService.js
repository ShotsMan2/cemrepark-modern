import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import redis, { cacheGet, cacheSet, cacheDel } from "@/lib/redis";

const filePath = path.join(process.cwd(), "src", "data", "products.json");

const CACHE_KEY_PRODUCTS = "all_products";
const CACHE_KEY_CATEGORIES = "all_categories";
const CACHE_KEY_BANNERS = "all_banners";

class ProductService {
  async _readProductsFromJson() {
    try {
      const fileContents = await fs.promises.readFile(filePath, "utf8");
      return JSON.parse(fileContents);
    } catch (error) {
      logger.error("Failed to read products.json", { error: error.message });
      return [];
    }
  }

  async _writeProductsToJson(data) {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  async getProducts() {
    const cached = await cacheGet(CACHE_KEY_PRODUCTS);
    if (cached) return cached;

    const products = await this._readProductsFromJson();

    // Cache for 5 minutes
    await cacheSet(CACHE_KEY_PRODUCTS, products, 300);
    return products;
  }

  async addProduct(productData) {
    const products = await this._readProductsFromJson();

    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct = {
      id: newId,
      ...productData,
    };

    products.unshift(newProduct);
    await this._writeProductsToJson(products);
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      await prisma.product.create({
        data: {
          id: newId,
          ad: newProduct.ad || "",
          fiyat: parseFloat(newProduct.fiyat) || 0,
          kategori: newProduct.kategori || "",
          resim: newProduct.resim || "",
          gorsel: newProduct.gorsel || "",
          etiket: newProduct.etiket || "",
          renk: newProduct.renk || "",
          beden: newProduct.beden || "",
        },
      });
    } catch (dbErr) {
      logger.error("DB product sync error:", { error: dbErr.message, stack: dbErr.stack });
    }

    return newProduct;
  }

  async updateProduct(id, productData) {
    let products = await this._readProductsFromJson();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      const error = new Error("Ürün bulunamadı");
      error.statusCode = 404;
      throw error;
    }

    products[index] = { ...products[index], ...productData, id };
    await this._writeProductsToJson(products);
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      await prisma.product.upsert({
        where: { id },
        update: {
          ad: productData.ad || "",
          fiyat: parseFloat(productData.fiyat) || 0,
          kategori: productData.kategori || "",
          resim: productData.resim || "",
          gorsel: productData.gorsel || "",
          etiket: productData.etiket || "",
          renk: productData.renk || "",
          beden: productData.beden || "",
        },
        create: {
          id,
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
    } catch (dbErr) {
      logger.error("DB product PUT sync error:", { error: dbErr.message, stack: dbErr.stack });
    }

    return products[index];
  }

  async deleteProduct(id) {
    let products = await this._readProductsFromJson();
    const filteredProducts = products.filter((p) => p.id !== id);

    if (products.length === filteredProducts.length) {
      const error = new Error("Ürün bulunamadı");
      error.statusCode = 404;
      throw error;
    }

    await this._writeProductsToJson(filteredProducts);
    await cacheDel(CACHE_KEY_PRODUCTS);
    await cacheDel(CACHE_KEY_CATEGORIES);

    try {
      await prisma.review.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
    } catch (dbErr) {
      logger.error("DB product DELETE sync error:", { error: dbErr.message, stack: dbErr.stack });
    }

    return { success: true };
  }

  async getCategories() {
    const cached = await cacheGet(CACHE_KEY_CATEGORIES);
    if (cached) return cached;

    // Optional: Get categories based on products.json since productService works heavily with it, 
    // or fetch from prisma.category. Given prisma.category exists:
    try {
      const categories = await prisma.category.findMany();
      await cacheSet(CACHE_KEY_CATEGORIES, categories, 600); // 10 minutes cache
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
      await cacheSet(CACHE_KEY_BANNERS, banners, 600); // 10 minutes cache
      return banners;
    } catch (dbErr) {
      logger.error("DB getBanners error:", { error: dbErr.message });
      return [];
    }
  }
}

export const productService = new ProductService();
