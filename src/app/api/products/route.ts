import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { productService } from "@/services/productService";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

import { fetchWithCache } from "@/lib/redis";

export const GET = apiHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(`products-get:${ip}`, 1000, 60); // 1000 requests per minute for dev
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const filters = {
    search: url.searchParams.get("search") || undefined,
    category: url.searchParams.get("category") || undefined,
    minPrice: url.searchParams.get("minPrice") ? parseFloat(url.searchParams.get("minPrice") as string) : undefined,
    maxPrice: url.searchParams.get("maxPrice") ? parseFloat(url.searchParams.get("maxPrice") as string) : undefined,
    color: url.searchParams.get("color") || undefined,
    categoryId: url.searchParams.get("categoryId") ? parseInt(url.searchParams.get("categoryId") as string, 10) : undefined,
  };

  const page = url.searchParams.get("page");
  if (page) {
    const limit = url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit") as string, 10) : 10;
    const sortBy = url.searchParams.get("sortBy") || "id";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    
    const cacheKey = `products:paginated:${JSON.stringify(filters)}:page=${page}:limit=${limit}:sort=${sortBy}:${sortOrder}`;
    
    const paginatedResult = await fetchWithCache(
      cacheKey,
      () => productService.getProductsPaginated(filters, parseInt(page, 10), limit, sortBy, sortOrder),
      300 // 5 minutes cache
    );
    return NextResponse.json(paginatedResult);
  }

  const cacheKey = `products:all:${JSON.stringify(filters)}`;
  const products = await fetchWithCache(
    cacheKey,
    () => productService.getProducts(filters),
    300 // 5 minutes cache
  );
  return NextResponse.json(products);
});

export const POST = apiHandler(async (request: NextRequest) => {
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
    const error = new Error("Yetkisiz Erisim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await request.json();
  const newProduct = await productService.addProduct(body);

  return NextResponse.json(newProduct, { status: 201 });
});
