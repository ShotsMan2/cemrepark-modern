import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getProductById } from '@/data/products';

export async function POST(req) {
  try {
    const { productId, userId, rating, comment } = await req.json();

    if (!productId || !userId || !rating) {
      return NextResponse.json(
        { error: 'Eksik bilgi gönderildi' },
        { status: 400 }
      );
    }

    // Ensure product exists in SQLite DB before adding review to satisfy foreign key constraints
    const productInfo = getProductById(productId);
    if (productInfo) {
      await prisma.product.upsert({
        where: { id: parseInt(productId) },
        update: {
          ad: productInfo.ad || '',
          fiyat: parseFloat(productInfo.fiyat) || 0,
          kategori: productInfo.kategori || '',
          resim: productInfo.resim || '',
          gorsel: productInfo.gorsel || '',
          etiket: productInfo.etiket || '',
          renk: productInfo.renk || '',
          beden: productInfo.beden || '',
        },
        create: {
          id: parseInt(productId),
          ad: productInfo.ad || '',
          fiyat: parseFloat(productInfo.fiyat) || 0,
          kategori: productInfo.kategori || '',
          resim: productInfo.resim || '',
          gorsel: productInfo.gorsel || '',
          etiket: productInfo.etiket || '',
          renk: productInfo.renk || '',
          beden: productInfo.beden || '',
        }
      });
    }

    const review = await prisma.review.create({
      data: {
        productId: parseInt(productId),
        userId: parseInt(userId),
        rating: parseInt(rating),
        comment: comment || '',
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json(
      { error: 'Yorum eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  
  try {
    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID zorunludur' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: parseInt(productId) },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Review get error:', error);
    return NextResponse.json(
      { error: 'Yorumlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
