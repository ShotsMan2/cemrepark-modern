import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";
import { rateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/orders
 *
 * Fetches all orders from the database. Requires admin privileges.
 *
 * @param {Request} req - The incoming HTTP request.
 *
 * @returns {Promise<NextResponse>} JSON response containing an array of orders.
 * @throws {403} Forbidden if the user is not an admin.
 * @throws {429} Too Many Requests if rate limit is exceeded.
 */
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

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const page = searchParams.get("page");

  if (page) {
    const pageNum = parseInt(page) || 1;
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const filters = { search, status };

    const paginatedOrders = await orderService.getOrdersPaginated(
      filters,
      pageNum,
      limit,
      sortBy,
      sortOrder
    );
    return NextResponse.json(paginatedOrders);
  }

  const orders = await orderService.getAllOrders();
  return NextResponse.json(orders);
});

import { z } from "zod";

const orderSchema = z.object({
  customer: z.string().min(1, "Customer name is required"),
  userId: z.number().optional().nullable(),
  total: z.number().min(0, "Total must be non-negative"),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
        price: z.number().min(0),
      })
    )
    .optional(),
  couponCode: z.string().optional().nullable(),
  discountAmount: z.number().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  carrier: z.string().optional().nullable(),
});

/**
 * POST /api/orders
 *
 * Creates a new order. Validates input using Zod schema.
 * If a coupon code is provided, increments its usage count.
 *
 * @param {Request} req - The incoming HTTP request.
 * @body {Object} Order payload (customer, userId, total, items, etc.).
 *
 * @returns {Promise<NextResponse>} JSON response containing the newly created order.
 * @throws {400} Bad Request if validation fails.
 * @throws {429} Too Many Requests if rate limit is exceeded.
 */
export const POST = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60); // 20 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const body = await req.json();
  const { customer, userId, total, items, couponCode, discountAmount, trackingNumber, carrier } =
    body;

  const newOrder = await orderService.createOrder(
    { customer, userId, total, couponCode, discountAmount, trackingNumber, carrier } as any,
    items || []
  );

  // If coupon code is used, increment the usedCount
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

  const userAgent = req.headers.get("user-agent") || "unknown";

  await import("@/lib/auditLogger").then(({ logAuditAction }) =>
    logAuditAction({
      action: "CREATE_ORDER",
      userId: userId || null,
      entity: "Order",
      entityId: newOrder.id.toString(),
      details: `New order created for customer: ${customer}`,
      changes: JSON.stringify({ items, total }),
      ipAddress: ip,
      userAgent,
    })
  );

  return NextResponse.json(newOrder, { status: 201 });
}, orderSchema);

const patchOrderSchema = z
  .object({
    id: z.number().optional(),
    orderIds: z.array(z.number()).optional(),
    status: z.string().optional(),
    trackingNumber: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
  })
  .refine((data) => data.id !== undefined || (data.orderIds && data.orderIds.length > 0), {
    message: "Order ID(s) required",
  });

/**
 * PATCH /api/orders
 *
 * Updates the status, tracking number, or carrier for one or more orders.
 * Requires admin privileges. If an order is cancelled or returned, restores the product stock.
 *
 * @param {Request} req - The incoming HTTP request.
 * @body {Object} Contains ids (or id), and fields to update (status, trackingNumber, carrier).
 *
 * @returns {Promise<NextResponse>} JSON response with success status and updated count.
 * @throws {400} Bad Request if no IDs or update data are provided.
 * @throws {403} Forbidden if the user is not an admin.
 * @throws {429} Too Many Requests if rate limit is exceeded.
 */
export const PATCH = apiHandler(async (req: Request) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60);
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { errorResponse, session } = await checkAdminAndLog(req as any);
  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim") as any;
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const { id, orderIds, status, trackingNumber, carrier } = body;

  const idsToUpdate = orderIds || (id ? [id] : []);

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

  const userAgent = req.headers.get("user-agent") || "unknown";
  const userId = (session?.user as any)?.id ? parseInt((session.user as any).id) : null;

  await import("@/lib/auditLogger").then(({ logAuditAction }) =>
    logAuditAction({
      action: "UPDATE_ORDERS",
      userId,
      entity: "Order",
      entityId: idsToUpdate.join(","),
      details: `Updated orders with IDs: ${idsToUpdate.join(", ")}`,
      changes: JSON.stringify(updateData),
      ipAddress: ip,
      userAgent,
    })
  );

  return NextResponse.json({
    success: true,
    count: updatedOrders.count,
    message: "Orders updated successfully",
  });
}, patchOrderSchema);
