import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { productId, userId, rating, comment } = await req.json();

    if (!productId || !userId || !rating) {
      return NextResponse.json(
        { error: 'Eksik bilgi gönderildi' },
        { status: 400 }
      );
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
          select: { email: true }
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
