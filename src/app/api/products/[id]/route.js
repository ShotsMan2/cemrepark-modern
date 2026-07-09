import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { productService } from "@/services/productService";

export const PUT = apiHandler(async (request, { params }) => {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const body = await request.json();

  const { errorResponse } = await checkAdminAndLog(
    request,
    "UPDATE_PRODUCT",
    `Updated product with ID ${id}`
  );

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const updatedProduct = await productService.updateProduct(id, body);
  return NextResponse.json(updatedProduct);
});

export const DELETE = apiHandler(async (request, { params }) => {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const { errorResponse } = await checkAdminAndLog(
    request,
    "DELETE_PRODUCT",
    `Deleted product with ID ${id}`
  );

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const result = await productService.deleteProduct(id);
  return NextResponse.json(result);
});
