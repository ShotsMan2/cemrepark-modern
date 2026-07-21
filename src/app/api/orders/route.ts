import { logger } from "@/lib/logger";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { createHandler, ApiError } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logAuditAction } from "@/lib/auditLogger";

const orderSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  userId: z.number().optional().nullable(),
  total: z.number().min(0, "Total must be non-negative").optional(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    variantId: z.number().optional().nullable(),
  })).optional(),
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  paymentMethod: z.string().optional().nullable(),
  shippingAddressId: z.number().optional().nullable(),
  billingAddressId: z.number().optional().nullable(),
});

export const GET = createHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 50, 60);
  if (!success) {
    throw new ApiError("Too Many Requests", 429);
  }

  const { errorResponse } = await checkAdminAndLog(req);

  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const aggregate = searchParams.get("aggregate");
  if (aggregate === "true") {
    return await orderService.getOrdersAggregation();
  }

  const page = searchParams.get("page");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const customer = searchParams.get("customer") || "";

  if (page) {
    const pageNum = parseInt(page) || 1;
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const filters = { search, status, paymentStatus, startDate, endDate, customer };
    return await orderService.getOrdersPaginated(filters, pageNum, limit, sortBy, sortOrder);
  }

  const orders = await orderService.getAllOrders();
  return orders;
});

export const POST = createHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60);
  if (!success) {
    throw new ApiError("Too Many Requests", 429);
  }

  const body = await req.json();
  const { customer, userId, total, items, couponCode, discountAmount, trackingNumber, carrier, paymentMethod, shippingAddressId, billingAddressId } = body;

  const newOrder = await orderService.createOrder(
    { customer, userId, total, couponCode, discountAmount, trackingNumber, carrier, paymentMethod, shippingAddressId, billingAddressId },
    items || []
  );

  if (couponCode) {
    try {
      await prisma.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      });
    } catch (e) {
      logger.error("Failed to increment coupon usage:", e);
    }
  }

  await logAuditAction({
    action: "CREATE_ORDER",
    userId: userId || null,
    entity: "Order",
    entityId: newOrder.id.toString(),
    details: `New order created for customer: ${customer}`,
  });

  return newOrder;
}, orderSchema);

const patchOrderSchema = z.object({
  id: z.number().optional(),
  orderIds: z.array(z.number()).optional(),
  status: z.string().optional(),
  trackingNumber: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine((data) => data.id !== undefined || (data.orderIds && data.orderIds.length > 0), {
  message: "Order ID(s) required",
});

export const PATCH = createHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60);
  if (!success) {
    throw new ApiError("Too Many Requests", 429);
  }

  const { errorResponse, session } = await checkAdminAndLog(req);
  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  const body = await req.json();
  const { id, orderIds, status, trackingNumber, carrier, notes } = body;

  const idsToUpdate = orderIds || (id ? [id] : []);

  const updateData: any = {};
  if (status !== undefined) updateData.status = status;
  if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
  if (carrier !== undefined) updateData.carrier = carrier;
  if (notes !== undefined) updateData.notes = notes;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError("No update data provided", 400);
  }

  if (status) {
    const { OrderStateMachine } = await import("@/services/orderStateMachine");
    const orders = await prisma.order.findMany({
      where: { id: { in: idsToUpdate } },
    });

    for (const order of orders) {
      try {
        const stateMachine = new OrderStateMachine(order.status);
        stateMachine.transitionTo(status);
      } catch (e) {
        throw new ApiError(`Invalid status transition for order ${order.id}: ${e.message}`, 400);
      }
    }
  }

  const isCancelledOrReturned = status === "İptal Edildi" || status === "İade Edildi" || status === "CANCELLED" || status === "RETURNED";

  const updatedOrders = await prisma.order.updateMany({
    where: { id: { in: idsToUpdate } },
    data: updateData,
  });

  if (isCancelledOrReturned) {
    const orders = await prisma.order.findMany({
      where: { id: { in: idsToUpdate } },
      include: { items: true },
    });
    for (const order of orders) {
      if (order.items) {
        for (const item of order.items) {
          try {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stok: { increment: item.quantity } },
            });
          } catch (e) {
            logger.error(`Failed to restore stock for product ${item.productId}:`, e);
          }
        }
      }
    }
  }

  const userId = session?.user?.id ? parseInt(session.user.id) : null;
  await logAuditAction({
    action: "UPDATE_ORDERS",
    userId,
    entity: "Order",
    entityId: idsToUpdate.join(","),
    details: `Updated orders with IDs: ${idsToUpdate.join(", ")}${status ? ` to status: ${status}` : ""}`,
  });

  return {
    success: true,
    count: updatedOrders.count,
    message: "Orders updated successfully",
  };
}, patchOrderSchema);
