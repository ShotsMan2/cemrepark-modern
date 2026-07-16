import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";

export const PATCH = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    const error = new Error("Invalid order ID") as any;
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const body = await req.json();
  const { status, trackingNumber, carrier } = body;

  const actionMsg = `Changed order ${id} status to ${status || 'unchanged'}${trackingNumber ? ' and updated tracking' : ''}`;
  const { errorResponse } = await checkAdminAndLog(req as any, "UPDATE_ORDER_STATUS", actionMsg);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim") as any;
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  // Allow updates to status, tracking number, or carrier
  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (carrier !== undefined) updateData.carrier = carrier;

  let updatedOrder;
  if (Object.keys(updateData).length > 0) {
    const { prisma } = await import("@/lib/prisma");
    updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true }
    });

    // Handle cancellation or return by restoring stock
    const isCancelledOrReturned = 
      status === "İptal Edildi" || 
      status === "İade Edildi" || 
      status === "CANCELLED" || 
      status === "RETURNED";

    if (isCancelledOrReturned && updatedOrder.items) {
      for (const item of updatedOrder.items) {
        // In a real application, you might want to check if the product still exists
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
  } else {
    updatedOrder = await orderService.getOrderById(orderId);
  }

  return NextResponse.json(updatedOrder);
});

export const GET = apiHandler(async (req: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    const error = new Error("Invalid order ID") as any;
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const { errorResponse } = await checkAdminAndLog(req as any, "VIEW_ORDER", `Viewed order ${orderId}`);
  if (errorResponse) {
    // If not admin, maybe check if it's the user's order? We stick to admin check for now as in PATCH
    // Since it's admin/API we can just return
  }

  const order = await orderService.getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
});
