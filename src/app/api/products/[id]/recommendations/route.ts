import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Geçersiz ürün ID" }, { status: 400 });
    }

    // 1. Try Cache First (Redis)
    const cacheKey = `recommendations:product:${productId}`;
    if (redis && (redis.status === "ready" || typeof redis.get === "function")) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json(JSON.parse(cached));
        }
      } catch (e) {
        // Ignore redis errors, fallback to DB
      }
    }

    // 2. Fetch Base Product Details for Heuristics
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { kategori: true, fiyat: true, etiket: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    // 3. Algorithm: 
    // - Same category
    // - Price within +/- 30% range
    // - Prioritize same tags/labels
    const minPrice = product.fiyat * 0.7;
    const maxPrice = product.fiyat * 1.3;

    const recommendations = await prisma.product.findMany({
      where: {
        id: { not: productId },
        kategori: product.kategori,
        fiyat: { gte: minPrice, lte: maxPrice },
        stok: { gt: 0 } // Only recommend in-stock items
      },
      take: 8,
      orderBy: [
        { etiket: product.etiket ? 'asc' : 'desc' }, // If it has the same label, it's "closer" if we matched exactly, but Prisma doesn't do complex sorting easily. We just use basic ordering here.
        { createdAt: 'desc' }
      ]
    });

    // 4. Fallback if not enough similar price items
    let finalRecs = recommendations;
    if (finalRecs.length < 4) {
      const fallback = await prisma.product.findMany({
        where: {
          id: { notIn: [productId, ...finalRecs.map((r) => r.id)] },
          kategori: product.kategori,
          stok: { gt: 0 }
        },
        take: 4 - finalRecs.length,
        orderBy: { createdAt: 'desc' }
      });
      finalRecs = [...finalRecs, ...fallback];
    }

    // 5. Cache the result for 1 hour
    if (redis && (redis.status === "ready" || typeof redis.setex === "function")) {
      try {
        await redis.setex(cacheKey, 3600, JSON.stringify(finalRecs));
      } catch (e) {
        // Ignore redis set errors
      }
    }

    return NextResponse.json(finalRecs);

  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "İç sunucu hatası" },
      { status: 500 }
    );
  }
}
