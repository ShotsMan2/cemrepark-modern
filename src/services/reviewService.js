import prisma from "@/lib/prisma";
import { productService } from "@/services/productService";

class ReviewService {
  async addReview(productId, userId, rating, comment) {
    if (!productId || !userId || !rating) {
      const error = new Error("Eksik bilgi gönderildi");
      error.statusCode = 400;
      throw error;
    }

    // Ensure product exists in DB before adding review to satisfy foreign key constraints
    const products = await productService.getProducts();
    const productInfo = products.find((p) => p.id === parseInt(productId));

    if (productInfo) {
      await prisma.product.upsert({
        where: { id: parseInt(productId) },
        update: {
          ad: productInfo.ad || "",
          fiyat: parseFloat(productInfo.fiyat) || 0,
          kategori: productInfo.kategori || "",
          resim: productInfo.resim || "",
          gorsel: productInfo.gorsel || "",
          etiket: productInfo.etiket || "",
          renk: productInfo.renk || "",
          beden: productInfo.beden || "",
        },
        create: {
          id: parseInt(productId),
          ad: productInfo.ad || "",
          fiyat: parseFloat(productInfo.fiyat) || 0,
          kategori: productInfo.kategori || "",
          resim: productInfo.resim || "",
          gorsel: productInfo.gorsel || "",
          etiket: productInfo.etiket || "",
          renk: productInfo.renk || "",
          beden: productInfo.beden || "",
        },
      });
    }

    return await prisma.review.create({
      data: {
        productId: parseInt(productId),
        userId: parseInt(userId),
        rating: parseInt(rating),
        comment: comment || "",
      },
    });
  }

  async getReviews(productId) {
    if (!productId) {
      const error = new Error("Ürün ID zorunludur");
      error.statusCode = 400;
      throw error;
    }

    return await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const reviewService = new ReviewService();
