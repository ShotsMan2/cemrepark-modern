import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 50, 60); // 50 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { errorResponse } = await checkAdminAndLog(req);
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const orders = await orderService.getAllOrders();
  return NextResponse.json(orders);
});

export const POST = apiHandler(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60); // 20 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  // Normally you might not require admin to create an order, but let's parse body
  const body = await req.json();
  const { customer, userId, total, items, couponCode, discountAmount } = body;
  
  if (!customer) {
    const error = new Error("Customer name is required");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const newOrder = await orderService.createOrder({ customer, userId, total, couponCode, discountAmount }, items || []);
  
  // If coupon code is used, increment the usedCount
  if (couponCode) {
    try {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } }
      });
    } catch (e) {
      console.error("Failed to increment coupon usage:", e);
    }
  }

  return NextResponse.json(newOrder, { status: 201 });
});
