import { logger } from "@/lib/logger";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAndLog } from "@/lib/adminAuth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { errorResponse } = await checkAdminAndLog(
    req,
    "UPDATE_COUPON",
    `Kupon güncelledi (ID: ${resolvedParams.id})`
  );
  if (errorResponse) return errorResponse;

  try {
    const data = await req.json();
    const updatedCoupon = await prisma.coupon.update({
      where: { id: parseInt(resolvedParams.id) },
      data: {
        code: data.code?.toUpperCase(),
        discountType: data.discountType,
        discountValue:
          data.discountValue !== undefined ? parseFloat(data.discountValue) : undefined,
        minCartValue:
          data.minCartValue !== undefined
            ? data.minCartValue
              ? parseFloat(data.minCartValue)
              : null
            : undefined,
        maxUses:
          data.maxUses !== undefined ? (data.maxUses ? parseInt(data.maxUses) : null) : undefined,
        expiresAt:
          data.expiresAt !== undefined
            ? data.expiresAt
              ? new Date(data.expiresAt)
              : null
            : undefined,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(updatedCoupon);
  } catch (error) {
    logger.error("PUT /api/coupons/[id] error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { errorResponse } = await checkAdminAndLog(
    req,
    "DELETE_COUPON",
    `Kupon sildi (ID: ${resolvedParams.id})`
  );
  if (errorResponse) return errorResponse;

  try {
    await prisma.coupon.delete({
      where: { id: parseInt(resolvedParams.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE /api/coupons/[id] error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
