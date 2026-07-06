import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { orderService } from "@/services/orderService";

export const PATCH = apiHandler(async (req, { params }) => {
  const { id } = params;
  const orderId = parseInt(id);

  if (isNaN(orderId)) {
    const error = new Error("Invalid order ID");
    error.statusCode = 400;
    error.isOperational = true;
    throw error;
  }
  
  const body = await req.json();
  const { status } = body;

  const { errorResponse } = await checkAdminAndLog(req, "UPDATE_ORDER_STATUS", `Changed order ${id} status to ${status}`);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const updatedOrder = await orderService.updateOrderStatus(orderId, status);
  return NextResponse.json(updatedOrder);
});
