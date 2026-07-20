import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { bannerService } from "@/services/bannerService";

import { fetchWithCache, cacheDel } from "@/lib/redis";

export const GET = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const banner = await fetchWithCache(
      `banner:${resolvedParams.id}`,
      () => bannerService.getBannerById(resolvedParams.id),
      300
    );
    return NextResponse.json(banner);
  }
);

export const PUT = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const { errorResponse } = await checkAdminAndLog(
      req,
      "UPDATE_BANNER",
      `Updated banner with ID ${resolvedParams.id}`
    );

    if (errorResponse) {
      const error = new Error("Yetkisiz Erişim") as Error & {
        statusCode?: number;
        isOperational?: boolean;
      };
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const body = await req.json();
    const banner = await bannerService.updateBanner(resolvedParams.id, body);
    await cacheDel("banners:all");
    await cacheDel(`banner:${resolvedParams.id}`);
    return NextResponse.json(banner);
  }
);

export const DELETE = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const bannerId = parseInt(resolvedParams.id);
    const { errorResponse } = await checkAdminAndLog(
      req,
      "DELETE_BANNER",
      `Deleted banner with ID ${bannerId}`
    );

    if (errorResponse) {
      const error = new Error("Yetkisiz Erişim") as Error & {
        statusCode?: number;
        isOperational?: boolean;
      };
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const result = await bannerService.deleteBanner(bannerId);
    await cacheDel("banners:all");
    await cacheDel(`banner:${bannerId}`);
    return NextResponse.json(result);
  }
);
