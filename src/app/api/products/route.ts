import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { productService } from "@/services/productService";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

import { fetchWithCache } from "@/lib/redis";
import { z } from "zod";

/**
 * GET /api/products
 *
 * Fetches products from the database, with optional pagination and filtering.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @query search {string} - Optional search keyword.
 * @query category {string} - Optional category name filter.
 * @query minPrice {number} - Optional minimum price filter.
 * @query maxPrice {number} - Optional maximum price filter.
 * @query color {string} - Optional color filter.
 * @query categoryId {number} - Optional category ID filter.
 * @query page {number} - Page number for pagination.
 * @query limit {number} - Number of items per page (default: 10).
 * @query sortBy {string} - Field to sort by (default: 'id').
 * @query sortOrder {string} - Sort direction ('asc' or 'desc', default: 'desc').
 *
 * @returns {Promise<NextResponse>} JSON response containing an array of products or paginated result object.
 * @throws {429} Too Many Requests if rate limit is exceeded.
 */
export const GET = apiHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(`products-get:${ip}`, 1000, 60); // 1000 requests per minute for dev
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);

  const querySchema = z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    color: z.string().optional(),
    categoryId: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
    limit: z.coerce.number().default(10),
    sortBy: z.string().default("id"),
    sortOrder: z.string().default("desc"),
  });

  const parsedQuery = querySchema.safeParse(queryParams);

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsedQuery.error.issues },
      { status: 400 }
    );
  }

  const {
    search,
    category,
    minPrice,
    maxPrice,
    color,
    categoryId,
    page,
    limit,
    sortBy,
    sortOrder,
  } = parsedQuery.data;

  const filters = { search, category, minPrice, maxPrice, color, categoryId };

  if (page) {
    const cacheKey = `products:paginated:${JSON.stringify(filters)}:page=${page}:limit=${limit}:sort=${sortBy}:${sortOrder}`;

    const paginatedResult = await fetchWithCache(
      cacheKey,
      () => productService.getProductsPaginated(filters, page, limit, sortBy, sortOrder),
      60 // 60 seconds TTL
    );
    return NextResponse.json(paginatedResult);
  }

  const cacheKey = `products:all:${JSON.stringify(filters)}`;
  const products = await fetchWithCache(
    cacheKey,
    () => productService.getProducts(filters),
    60 // 60 seconds TTL
  );
  return NextResponse.json(products);
});

/**
 * POST /api/products
 *
 * Creates a new product in the database. Requires admin privileges.
 *
 * @param {NextRequest} request - The incoming HTTP request.
 * @body {Object} Product details matching the expected product schema.
 *
 * @returns {Promise<NextResponse>} JSON response containing the newly created product.
 * @throws {403} Forbidden if the user is not an admin.
 * @throws {429} Too Many Requests if rate limit is exceeded.
 */
export const POST = apiHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60); // 20 requests per minute
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { errorResponse, session } = await checkAdminAndLog(request);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erisim") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await request.json();
  const newProduct = await productService.addProduct(body);
  
  const { cacheDel } = await import("@/lib/redis");
  await cacheDel("products:*");

  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const userId = (session?.user as any)?.id ? parseInt((session.user as any).id) : null;

  await import("@/lib/auditLogger").then(({ logAuditAction }) =>
    logAuditAction({
      action: "CREATE_PRODUCT",
      userId,
      entity: "Product",
      entityId: newProduct.id.toString(),
      details: `Created a new product: ${newProduct.ad}`,
      changes: JSON.stringify({ new: newProduct }),
      ipAddress,
      userAgent,
    })
  );

  return NextResponse.json(newProduct, { status: 201 });
});
