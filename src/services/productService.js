import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { LRUCache } from "lru-cache";
import logger from "@/lib/logger";

const filePath = path.join(process.cwd(), "src", "data", "products.json");

const cache = new LRUCache({
  max: 100, // Maximum items in cache
  ttl: 1000 * 60 * 5, // 5 minutes cache
});

const CACHE_KEY = "all_products";

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
    const cachedProducts = cache.get(CACHE_KEY);
    if (cachedProducts) {
      return cachedProducts;
    }

    const products = await this._readProductsFromJson();

    cache.set(CACHE_KEY, products);
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

    cache.delete(CACHE_KEY);

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

    cache.delete(CACHE_KEY);

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

    cache.delete(CACHE_KEY);

    try {
      await prisma.review.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
    } catch (dbErr) {
      logger.error("DB product DELETE sync error:", { error: dbErr.message, stack: dbErr.stack });
    }

    return { success: true };
  }
}

export const productService = new ProductService();
