import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { userService } from "@/services/userService";
import rateLimit from "@/lib/rateLimit";
import logger from "@/lib/logger";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export const POST = apiHandler(async (req) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  try {
    await limiter.check(10, ip); // 10 requests per minute per IP
  } catch {
    logger.warn("Rate limit exceeded", { ip });
    const error = new Error("Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.");
    error.statusCode = 429;
    error.isOperational = true;
    throw error;
  }

  const { email, password, name } = await req.json();
  const result = await userService.registerUser(email, password, name, ip);

  return NextResponse.json(result, { status: 201 });
});
