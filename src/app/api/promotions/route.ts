import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') !== 'false';

    const promotions = await prisma.promotion.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Promosyonlar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions as any);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const data = await req.json();
    const promotion = await prisma.promotion.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        conditionType: data.conditionType,
        conditionValue: data.conditionValue ? parseFloat(data.conditionValue) : null,
        discountValue: data.discountValue ? parseFloat(data.discountValue) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Promosyon oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
