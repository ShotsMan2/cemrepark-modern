import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import redis from "@/lib/redis";

const filePath = path.join(process.cwd(), "src", "data", "products.json");

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
    try {
      const cachedProducts = await redis.get(CACHE_KEY);
      if (cachedProducts) {
        return JSON.parse(cachedProducts);
      }
    } catch (err) {
      logger.error("Redis get error:", { error: err.message });
    }

    const products = await this._readProductsFromJson();

    try {
      await redis.set(CACHE_KEY, JSON.stringify(products), 'EX', 300); // 5 minutes cache
    } catch (err) {
      logger.error("Redis set error:", { error: err.message });
    }
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

    try {
      await redis.del(CACHE_KEY);
    } catch (err) {
      logger.error("Redis del error:", { error: err.message });
    }

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

    try {
      await redis.del(CACHE_KEY);
    } catch (err) {
      logger.error("Redis del error:", { error: err.message });
    }

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

    try {
      await redis.del(CACHE_KEY);
    } catch (err) {
      logger.error("Redis del error:", { error: err.message });
    }

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
