import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { productService } from "@/services/productService";

export const PUT = apiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const body = await request.json();

  const { errorResponse, session } = await checkAdminAndLog(request);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const updatedProduct = await productService.updateProduct(id, body);

  const { cacheDel } = await import("@/lib/redis");
  await cacheDel("products:*");
  await cacheDel(`product:${id}`); // In case individual product is cached elsewhere

  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const userId = (session?.user as any)?.id ? parseInt((session.user as any).id) : null;

  await import("@/lib/auditLogger").then(({ logAuditAction }) => logAuditAction({
    action: "UPDATE_PRODUCT",
    userId,
    entity: "Product",
    entityId: id.toString(),
    details: `Updated product: ${updatedProduct.ad}`,
    changes: JSON.stringify({ new: updatedProduct }),
    ipAddress,
    userAgent,
  }));

  return NextResponse.json(updatedProduct);
});

export const DELETE = apiHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);

  const { errorResponse, session } = await checkAdminAndLog(request);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const result = await productService.deleteProduct(id);

  const { cacheDel } = await import("@/lib/redis");
  await cacheDel("products:*");
  await cacheDel(`product:${id}`);

  const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const userId = (session?.user as any)?.id ? parseInt((session.user as any).id) : null;

  await import("@/lib/auditLogger").then(({ logAuditAction }) => logAuditAction({
    action: "DELETE_PRODUCT",
    userId,
    entity: "Product",
    entityId: id.toString(),
    details: `Deleted product with ID ${id}`,
    changes: JSON.stringify({ deleted: true }),
    ipAddress,
    userAgent,
  }));

  return NextResponse.json(result);
});
