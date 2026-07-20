import { logger } from "@/lib/logger";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { errorResponse } = await checkAdminAndLog(req, "VIEW_COUPONS", "Kuponları listeledi");
  if (errorResponse) return errorResponse;

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (error) {
    logger.error("GET /api/coupons error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    logger.error("POST /api/coupons error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu kupon kodu zaten mevcut." }, { status: 400 });
    }
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
