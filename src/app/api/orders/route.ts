import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export const GET = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 50, 60); // 50 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { errorResponse } = await checkAdminAndLog(req);
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim") as any;
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const orders = await orderService.getAllOrders();
  return NextResponse.json(orders);
});

export const POST = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60); // 20 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const body = await req.json();
  const { customer, userId, total, items, couponCode, discountAmount, trackingNumber, carrier } = body;
  
  if (!customer) {
    const error = new Error("Customer name is required") as any;
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const newOrder = await orderService.createOrder(
    { customer, userId, total, couponCode, discountAmount, trackingNumber, carrier } as any,
    items || []
  );
  
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

export const PATCH = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60);
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { errorResponse } = await checkAdminAndLog(req as any, "UPDATE_ORDERS", "Advanced status update");
  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim") as any;
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const { id, orderIds, status, trackingNumber, carrier } = body;
  
  const idsToUpdate = orderIds || (id ? [id] : []);

  if (idsToUpdate.length === 0) {
    const error = new Error("Order ID(s) required") as any;
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (carrier !== undefined) updateData.carrier = carrier;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No update data provided" }, { status: 400 });
  }

  const updatedOrders = await prisma.order.updateMany({
    where: { id: { in: idsToUpdate } },
    data: updateData,
  });

  const isCancelledOrReturned = 
    status === "İptal Edildi" || 
    status === "İade Edildi" || 
    status === "CANCELLED" || 
    status === "RETURNED";

  if (isCancelledOrReturned) {
    const orders = await prisma.order.findMany({
      where: { id: { in: idsToUpdate } },
      include: { items: true }
    });
    for (const order of orders) {
      if (order.items) {
        for (const item of order.items) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stok: { increment: item.quantity } }
            });
          } catch (e) {
            console.error(`Failed to restore stock for product ${item.productId}:`, e);
          }
        }
      }
    }
  }

  return NextResponse.json({ success: true, count: updatedOrders.count, message: "Orders updated successfully" });
});
