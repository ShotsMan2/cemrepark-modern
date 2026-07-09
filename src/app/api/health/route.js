import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { healthService } from "@/services/healthService";
import logger from "@/lib/logger";

export const GET = apiHandler(async () => {
  try {
    const status = await healthService.checkDatabase();
    logger.info("Health check passed");
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    const formattedError = new Error(error.message);
    formattedError.statusCode = 503;
    throw formattedError;
  }
});
