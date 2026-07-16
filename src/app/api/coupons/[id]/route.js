import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAndLog } from "@/lib/adminAuth";

export async function PUT(req, { params }) {
  const { errorResponse } = await checkAdminAndLog(req, "UPDATE_COUPON", `Kupon güncelledi (ID: ${params.id})`);
  if (errorResponse) return errorResponse;

  try {
    const data = await req.json();
    const updatedCoupon = await prisma.coupon.update({
      where: { id: parseInt(params.id) },
      data: {
        code: data.code?.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue !== undefined ? parseFloat(data.discountValue) : undefined,
        minCartValue: data.minCartValue !== undefined ? (data.minCartValue ? parseFloat(data.minCartValue) : null) : undefined,
        maxUses: data.maxUses !== undefined ? (data.maxUses ? parseInt(data.maxUses) : null) : undefined,
        expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(updatedCoupon);
  } catch (error) {
    console.error("PUT /api/coupons/[id] error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { errorResponse } = await checkAdminAndLog(req, "DELETE_COUPON", `Kupon sildi (ID: ${params.id})`);
  if (errorResponse) return errorResponse;

  try {
    await prisma.coupon.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/coupons/[id] error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
