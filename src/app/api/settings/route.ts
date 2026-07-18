import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { settingService } from "@/services/settingService";

export const GET = apiHandler(async () => {
  const settings = await settingService.getSettings();
  return NextResponse.json(settings);
});

export const POST = apiHandler(async (request: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(
    request,
    "UPDATE_SETTINGS",
    "Updated application settings"
  );
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await request.json();
  const updatedSettings = await settingService.updateSettings(body);
  return NextResponse.json(updatedSettings);
});
