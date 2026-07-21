import { NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { createHandler, ApiError } from "@/lib/apiHandler";
import { productService } from "@/services/productService";
import { rateLimit } from "@/lib/rate-limit";
import { fetchWithCache, cacheDel } from "@/lib/redis";
import { z } from "zod";
import { logAuditAction } from "@/lib/auditLogger";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  color: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().default(10),
  sortBy: z.string().default("id"),
  sortOrder: z.string().default("desc"),
  fields: z.string().optional(),
});

export const GET = createHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(`products-get:${ip}`, 1000, 60);
  if (!success) {
    throw new ApiError("Too Many Requests", 429);
  }

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);
  const parsedQuery = querySchema.safeParse(queryParams);

  if (!parsedQuery.success) {
    throw new ApiError("Invalid query parameters", 400, parsedQuery.error.issues);
  }

  const { search, category, minPrice, maxPrice, color, categoryId, inStock, page, limit, sortBy, sortOrder, fields } = parsedQuery.data;

  const filters = { search, category, minPrice, maxPrice, color, categoryId, inStock };

  if (page) {
    const cacheKey = `products:paginated:${JSON.stringify(filters)}:page=${page}:limit=${limit}:sort=${sortBy}:${sortOrder}`;
    return await fetchWithCache(
      cacheKey,
      () => productService.getProductsPaginated(filters, page, limit, sortBy, sortOrder),
      60
    );
  }

  const products = fields
    ? await productService.getProducts({ ...filters, fields })
    : await productService.getProducts(filters);
  return products;
});

export const POST = createHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(ip, 20, 60);
  if (!success) {
    throw new ApiError("Too Many Requests", 429);
  }

  const { errorResponse, session } = await checkAdminAndLog(request);

  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  const body = await request.json();
  const newProduct = await productService.addProduct(body);

  await cacheDel("products:*");

  const userId = session?.user?.id ? parseInt(session.user.id) : null;
  await logAuditAction({
    action: "CREATE_PRODUCT",
    userId,
    entity: "Product",
    entityId: newProduct.id.toString(),
    details: `Created a new product: ${newProduct.ad}`,
  });

  return newProduct;
});
