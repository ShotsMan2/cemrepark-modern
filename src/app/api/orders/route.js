import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";

export const GET = apiHandler(async (req) => {
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
  // Normally you might not require admin to create an order, but let's parse body
  const body = await req.json();
  const { customer, userId, total, items, discountCode } = body;
  
  if (!customer) {
    const error = new Error("Customer name is required");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }

  const newOrder = await orderService.createOrder({ customer, userId, total, discountCode }, items || []);
  return NextResponse.json(newOrder, { status: 201 });
});
