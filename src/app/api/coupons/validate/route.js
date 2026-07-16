import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { code, cartTotal } = await req.json();
    
    if (!code) {
      return NextResponse.json({ error: "Kupon kodu eksik." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Geçersiz veya süresi dolmuş kupon kodu." }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Bu kuponun süresi dolmuş." }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Bu kuponun kullanım limiti dolmuş." }, { status: 400 });
    }

    if (coupon.minCartValue !== null && cartTotal < coupon.minCartValue) {
      return NextResponse.json({ 
        error: `Bu kuponu kullanmak için sepet tutarı en az ${coupon.minCartValue} TL olmalıdır.` 
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discountAmount
      }
    });

  } catch (error) {
    console.error("POST /api/coupons/validate error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
