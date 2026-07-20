import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// POST /api/cart/sync - Sync local cart to server cart
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { cartItems } = body;

    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı.' }, { status: 400 });
    }

    // Create cart if not exists
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Upsert each item
    for (const item of cartItems) {
      if (!item.id) continue;
      
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: parseInt(item.id),
          color: item.renk || null,
          size: item.beden || null,
        },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + (item.quantity || 1) },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: parseInt(item.id),
            quantity: item.quantity || 1,
            color: item.renk || null,
            size: item.beden || null,
            variantId: item.variantId ? parseInt(item.variantId) : null,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Sepet eşitlendi.' });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: 'Senkronizasyon hatası.' }, { status: 500 });
  }
}
