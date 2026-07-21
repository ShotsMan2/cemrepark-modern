import { NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { createHandler, ApiError } from "@/lib/apiHandler";
import { analyticsService } from "@/services/analyticsService";

export const GET = createHandler(async (req: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(req, null, null);
  if (errorResponse) {
    throw new ApiError("Yetkisiz Erisim", 403);
  }

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "dashboard";
  const format = url.searchParams.get("format") || "json";
  const startDate = url.searchParams.get("startDate") || "";
  const endDate = url.searchParams.get("endDate") || "";
  const granularity = url.searchParams.get("granularity") || "day";

  if (type === "timeseries" && startDate && endDate) {
    return await analyticsService.getTimeSeriesData(startDate, endDate, granularity);
  }

  if (type === "export") {
    return await analyticsService.exportData(format, startDate, endDate);
  }

  if (type === "comparison") {
    return await analyticsService.getComparisonPeriods();
  }

  if (type === "topselling") {
    const limit = parseInt(url.searchParams.get("limit") || "10");
    return await analyticsService.getTopSellingProducts(limit);
  }

  if (type === "logins") {
    const days = parseInt(url.searchParams.get("days") || "7");
    return await analyticsService.getLoginTimeline(days);
  }

  return await analyticsService.getAnalytics();
});
