import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { bannerService } from "@/services/bannerService";
import { fetchWithCache, cacheDel } from "@/lib/redis";

export const GET = apiHandler(async () => {
  const banners = await fetchWithCache("banners:all", () => bannerService.getBanners(), 300);
  return NextResponse.json(banners);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(req, "CREATE_BANNER", "Created a new banner");
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const banner = await bannerService.createBanner(body);
  await cacheDel("banners:all");
  return NextResponse.json(banner, { status: 201 });
});
