import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 50, 60);
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active") !== "false";

  const promotions = await prisma.promotion.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(promotions);
});

export const POST = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60);
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { errorResponse } = await checkAdminAndLog(
    req as any,
    "CREATE_PROMOTION",
    "Created new promotion"
  );
  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim") as any;
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const {
    name,
    description,
    type,
    conditionType,
    conditionValue,
    discountValue,
    startDate,
    endDate,
    isActive,
  } = body;

  if (!name || !type) {
    const error = new Error("Name and type are required for promotion") as any;
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const promotion = await prisma.promotion.create({
    data: {
      name,
      description,
      type, // e.g. 'BUY_3_PAY_2', 'FREE_SHIPPING', 'PERCENTAGE_DISCOUNT'
      conditionType, // e.g. 'MIN_CART_VALUE'
      conditionValue: conditionValue ? parseFloat(conditionValue) : null,
      discountValue: discountValue ? parseFloat(discountValue) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive !== undefined ? isActive : true,
    },
  });

  return NextResponse.json(promotion, { status: 201 });
});
