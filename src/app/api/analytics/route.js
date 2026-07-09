import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { analyticsService } from "@/services/analyticsService";

export const GET = apiHandler(async (req) => {
  const { errorResponse } = await checkAdminAndLog(req, null, null);
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const analytics = await analyticsService.getAnalytics();
  return NextResponse.json(analytics);
});
