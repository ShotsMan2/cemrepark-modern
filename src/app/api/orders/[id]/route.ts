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

  // Assuming orderService supports updating tracking too. Otherwise, fallback to prisma.
  let updatedOrder;
  if (Object.keys(updateData).length > 0) {
    const { prisma } = await import("@/lib/prisma");
    updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  } else {
    updatedOrder = await orderService.getOrderById(orderId);
  }

  return NextResponse.json(updatedOrder);
});
