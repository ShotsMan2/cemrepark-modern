import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { productService } from "@/services/productService";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

export const GET = apiHandler(async (request) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(`products-get:${ip}`, 1000, 60); // 1000 requests per minute for dev
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const products = await productService.getProducts();
  return NextResponse.json(products);
});

export const POST = apiHandler(async (request) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60); // 20 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

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
