import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { createHandler, ApiError } from "@/lib/apiHandler";
import { productService } from "@/services/productService";
import { cacheDel } from "@/lib/redis";
import { logAuditAction } from "@/lib/auditLogger";

export const GET = createHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      throw new ApiError("Invalid product ID", 400);
    }

    const product = await productService.getProductById(id);
    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    return product;
  }
);

export const PUT = createHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      throw new ApiError("Invalid product ID", 400);
    }

    const { errorResponse, session } = await checkAdminAndLog(request);
    if (errorResponse) {
      throw new ApiError("Yetkisiz Erisim", 403);
    }

    const body = await request.json();
    const updatedProduct = await productService.updateProduct(id, body);

    await cacheDel("products:*");
    await cacheDel(`product:${id}`);

    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    await logAuditAction({
      action: "UPDATE_PRODUCT",
      userId,
      entity: "Product",
      entityId: id.toString(),
      details: `Updated product: ${updatedProduct.ad}`,
    });

    return updatedProduct;
  }
);

export const PATCH = createHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      throw new ApiError("Invalid product ID", 400);
    }

    const { errorResponse, session } = await checkAdminAndLog(request);
    if (errorResponse) {
      throw new ApiError("Yetkisiz Erisim", 403);
    }

    const body = await request.json();

    if (body.stock !== undefined) {
      const product = await productService.setStock(id, body.stock);
      await cacheDel("products:*");
      return product;
    }

    if (body.stockAdjustment !== undefined) {
      const product = await productService.updateStock(id, body.stockAdjustment);
      await cacheDel("products:*");
      return product;
    }

    if (body.variant) {
      const { variant, ...variantData } = body;
      if (variant === "add") {
        const newVariant = await productService.addVariant(id, variantData);
        await cacheDel("products:*");
        return newVariant;
      }
      if (variantData.variantId) {
        const updatedVariant = await productService.updateVariant(variantData.variantId, variantData);
        await cacheDel("products:*");
        return updatedVariant;
      }
    }

    const updatedProduct = await productService.updateProduct(id, body);
    await cacheDel("products:*");

    return updatedProduct;
  }
);

export const DELETE = createHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      throw new ApiError("Invalid product ID", 400);
    }

    const { errorResponse, session } = await checkAdminAndLog(request);
    if (errorResponse) {
      throw new ApiError("Yetkisiz Erisim", 403);
    }

    const result = await productService.deleteProduct(id);

    await cacheDel("products:*");
    await cacheDel(`product:${id}`);

    const userId = session?.user?.id ? parseInt(session.user.id) : null;
    await logAuditAction({
      action: "DELETE_PRODUCT",
      userId,
      entity: "Product",
      entityId: id.toString(),
      details: `Deleted product with ID ${id}`,
    });

    return result;
  }
);
