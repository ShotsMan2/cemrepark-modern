import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// GET /api/cart — Get current user's server-side cart
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                ad: true,
                fiyat: true,
                resim: true,
                gorsel: true,
                stok: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const total = cart.items.reduce((sum, item) => {
      return sum + (item.product.fiyat * item.quantity);
    }, 0);

    return NextResponse.json({
      id: cart.id,
      items: cart.items,
      total,
      itemCount: cart.items.length,
    });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Sepet yüklenirken hata oluştu.' }, { status: 500 });
  }
}

// POST /api/cart — Add item to cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { productId, quantity = 1, color, size, variantId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Ürün ID gerekli.' }, { status: 400 });
    }

    // Create cart if not exists
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Upsert cart item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId),
        color: color || null,
        size: size || null,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity,
          color: color || null,
          size: size || null,
          variantId: variantId ? parseInt(variantId) : null,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Ürün sepete eklendi.' });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Sepete ekleme hatası.' }, { status: 500 });
  }
}

// PUT /api/cart — Update cart item quantity
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Geçersiz parametreler.' }, { status: 400 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: parseInt(itemId) } });
      return NextResponse.json({ success: true, message: 'Ürün sepetten kaldırıldı.' });
    }

    await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity },
    });

    return NextResponse.json({ success: true, message: 'Sepet güncellendi.' });
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Sepet güncelleme hatası.' }, { status: 500 });
  }
}

// DELETE /api/cart — Clear entire cart
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    return NextResponse.json({ success: true, message: 'Sepet temizlendi.' });
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Sepet temizleme hatası.' }, { status: 500 });
  }
}
