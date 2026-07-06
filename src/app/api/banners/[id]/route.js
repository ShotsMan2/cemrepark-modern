import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { bannerService } from "@/services/bannerService";

export const GET = apiHandler(async (req, { params }) => {
  const resolvedParams = await params;
  const banner = await bannerService.getBannerById(resolvedParams.id);
  return NextResponse.json(banner);
});

export const PUT = apiHandler(async (req, { params }) => {
  const resolvedParams = await params;
  const { errorResponse } = await checkAdminAndLog(
    req,
    "UPDATE_BANNER",
    `Updated banner with ID ${resolvedParams.id}`
  );

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const banner = await bannerService.updateBanner(resolvedParams.id, body);
  return NextResponse.json(banner);
});

export const DELETE = apiHandler(async (req, { params }) => {
  const resolvedParams = await params;
  const bannerId = parseInt(resolvedParams.id);
  const { errorResponse } = await checkAdminAndLog(
    req,
    "DELETE_BANNER",
    `Deleted banner with ID ${bannerId}`
  );

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const result = await bannerService.deleteBanner(bannerId);
  return NextResponse.json(result);
});
