import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET /api/shipping — List all shipping methods
export async function GET() {
  try {
    const methods = await prisma.shippingMethod.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(methods);
  } catch (error) {
    console.error('Shipping GET error:', error);
    return NextResponse.json({ error: 'Kargo yöntemleri yüklenemedi.' }, { status: 500 });
  }
}

// POST /api/shipping — Create a new shipping method (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { name, provider, price, freeAbove, isActive, estimatedDays } = await request.json();

    if (!name || !provider || price === undefined) {
      return NextResponse.json({ error: 'Ad, sağlayıcı ve fiyat gerekli.' }, { status: 400 });
    }

    const method = await prisma.shippingMethod.create({
      data: {
        name,
        provider,
        price: parseFloat(price),
        freeAbove: freeAbove ? parseFloat(freeAbove) : null,
        isActive: isActive !== false,
        estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
      },
    });

    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    console.error('Shipping POST error:', error);
    return NextResponse.json({ error: 'Kargo yöntemi oluşturulamadı.' }, { status: 500 });
  }
}

// PUT /api/shipping — Update a shipping method (Admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { id, name, provider, price, freeAbove, isActive, estimatedDays } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });
    }

    const method = await prisma.shippingMethod.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(provider && { provider }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(freeAbove !== undefined && { freeAbove: freeAbove ? parseFloat(freeAbove) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(estimatedDays !== undefined && { estimatedDays: estimatedDays ? parseInt(estimatedDays) : null }),
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error('Shipping PUT error:', error);
    return NextResponse.json({ error: 'Kargo yöntemi güncellenemedi.' }, { status: 500 });
  }
}

// DELETE /api/shipping — Delete a shipping method (Admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID gerekli.' }, { status: 400 });
    }

    await prisma.shippingMethod.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, message: 'Kargo yöntemi silindi.' });
  } catch (error) {
    console.error('Shipping DELETE error:', error);
    return NextResponse.json({ error: 'Kargo yöntemi silinemedi.' }, { status: 500 });
  }
}
