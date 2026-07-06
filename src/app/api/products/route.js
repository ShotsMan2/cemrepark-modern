import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { productService } from "@/services/productService";

export const GET = apiHandler(async () => {
  const products = await productService.getProducts();
  return NextResponse.json(products);
});

export const POST = apiHandler(async (request) => {
  const { errorResponse } = await checkAdminAndLog(
    request,
    "CREATE_PRODUCT",
    `Created a new product`
  );
  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await request.json();
  const newProduct = await productService.addProduct(body);

  return NextResponse.json(newProduct, { status: 201 });
});
