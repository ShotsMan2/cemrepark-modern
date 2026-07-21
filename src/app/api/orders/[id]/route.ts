import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { createHandler, ApiError } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";
import { prisma } from "@/lib/prisma";
import { logAuditAction } from "@/lib/auditLogger";

export const GET = createHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) {
    throw new ApiError("Invalid order ID", 400);
  }

  const { errorResponse } = await checkAdminAndLog(req, "VIEW_ORDER", `Viewed order ${orderId}`);
  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  const order = await orderService.getOrderById(orderId);
  if (!order) {
    throw new ApiError("Order not found", 404);
  }

  return order;
});

export const PATCH = createHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) {
    throw new ApiError("Invalid order ID", 400);
  }

  const body = await req.json();
  const { status, trackingNumber, carrier, notes } = body;

  const { errorResponse, session } = await checkAdminAndLog(req, "UPDATE_ORDER_STATUS", `Changed order ${orderId}`);
  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  if (status) {
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    await logAuditAction({
      action: "UPDATE_ORDER_STATUS",
      userId,
      entity: "Order",
      entityId: orderId.toString(),
      details: `Status updated to ${status} for order ${orderId}`,
    });
    return updatedOrder;
  }

  const updateData: any = {};
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (carrier !== undefined) updateData.carrier = carrier;
  if (notes !== undefined) updateData.notes = notes;

  let updatedOrder;
  if (Object.keys(updateData).length > 0) {
    updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });
  } else {
    updatedOrder = await orderService.getOrderById(orderId);
  }

  return updatedOrder;
});

export const DELETE = createHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.id);

  if (isNaN(orderId)) {
    throw new ApiError("Invalid order ID", 400);
  }

  const { errorResponse, session } = await checkAdminAndLog(req);
  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  await prisma.order.delete({ where: { id: orderId } });

  const userId = session?.user?.id ? parseInt(session.user.id) : null;
  await logAuditAction({
    action: "DELETE_ORDER",
    userId,
    entity: "Order",
    entityId: orderId.toString(),
    details: `Deleted order ${orderId}`,
  });

  return { success: true, message: "Order deleted successfully" };
});
