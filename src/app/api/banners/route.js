import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { bannerService } from "@/services/bannerService";

export const GET = apiHandler(async () => {
  const banners = await bannerService.getBanners();
  return NextResponse.json(banners);
});

export const POST = apiHandler(async (req) => {
  const { errorResponse } = await checkAdminAndLog(req, "CREATE_BANNER", "Created a new banner");
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const banner = await bannerService.createBanner(body);
  return NextResponse.json(banner, { status: 201 });
});
