import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAndLog } from "@/lib/adminAuth";

export async function GET(req) {
  const { errorResponse } = await checkAdminAndLog(req, "VIEW_COUPONS", "Kuponları listeledi");
  if (errorResponse) return errorResponse;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await checkAdminAndLog(req, "CREATE_COUPON", "Yeni kupon oluşturdu");
  if (errorResponse) return errorResponse;

  try {
    const data = await req.json();
    const newCoupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        minCartValue: data.minCartValue ? parseFloat(data.minCartValue) : null,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Bu kupon kodu zaten mevcut." }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
