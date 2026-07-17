import { NextResponse, NextRequest } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(`promotion-evaluate:${ip}`, 20, 60);
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const body = await req.json();
  const { cartTotal, itemCount } = body;

  if (cartTotal === undefined || itemCount === undefined) {
    return NextResponse.json(
      { error: "Eksik parametreler (cartTotal, itemCount)" },
      { status: 400 }
    );
  }

  const now = new Date();

  // Fetch active promotions that fall within the current date range
  const activePromotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
  });

  const appliedPromotions = [];
  let totalDiscount = 0;
  let isFreeShipping = false;

  for (const promo of activePromotions) {
    let qualifies = false;

    // Check conditions
    if (!promo.conditionType) {
      qualifies = true; // No condition, unconditionally applies
    } else if (promo.conditionType === "MIN_CART_VALUE" && promo.conditionValue !== null) {
      if (cartTotal >= promo.conditionValue) qualifies = true;
    } else if (promo.conditionType === "MIN_ITEM_COUNT" && promo.conditionValue !== null) {
      if (itemCount >= promo.conditionValue) qualifies = true;
    }

    if (qualifies) {
      let discountAmount = 0;

      // Apply effects
      if (promo.type === "FREE_SHIPPING") {
        isFreeShipping = true;
      } else if (promo.type === "PERCENTAGE_DISCOUNT" && promo.discountValue) {
        discountAmount = (cartTotal * promo.discountValue) / 100;
      } else if (promo.type === "FIXED_DISCOUNT" && promo.discountValue) {
        discountAmount = promo.discountValue;
      }

      totalDiscount += discountAmount;

      appliedPromotions.push({
        id: promo.id,
        name: promo.name,
        type: promo.type,
        discountApplied: discountAmount,
      });
    }
  }

  // Ensure discount doesn't exceed cart total
  if (totalDiscount > cartTotal) {
    totalDiscount = cartTotal;
  }

  return NextResponse.json({
    appliedPromotions,
    totalDiscount,
    isFreeShipping,
    finalTotal: Math.max(0, cartTotal - totalDiscount),
  });
});
