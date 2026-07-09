import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

// Mobile-optimized endpoint: Returns minimal data to save battery and bandwidth on iOS/Android
export async function GET(req) {
  try {
    logger.info('[Mobile API] Fetching optimized products list');
    
    // Fetch only necessary fields for mobile UI (id, name, price, thumbnail)
    const mobileProducts = await prisma.product.findMany({
      select: {
        id: true,
        ad: true,
        fiyat: true,
        stok: true,
      },
      take: 20
    });

    return NextResponse.json(mobileProducts);
  } catch (error) {
    logger.error('[Mobile API] Error fetching products:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
