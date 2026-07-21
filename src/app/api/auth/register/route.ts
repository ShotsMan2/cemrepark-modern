import { NextRequest } from "next/server";
import { apiHandler } from "@/lib/apiHandler";
import { userService } from "@/services/userService";
import rateLimit from "@/lib/rateLimit";
import logger from "@/lib/logger";
import { z } from "zod";
import { successResponse, errorResponse } from "@/utils/apiResponse";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır."),
  name: z.string().min(2, "Adınız en az 2 karakter olmalıdır."),
});

export const POST = apiHandler(async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  try {
    await limiter.check(10, ip); // 10 requests per minute per IP
  } catch {
    logger.warn("Rate limit exceeded", { ip });
    return errorResponse(
      "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
      undefined,
      429
    );
  }

  const body = await req.json();
  const { email, password, name } = body;

  const result = await userService.registerUser(email, password, name, ip);

  return successResponse(result, "Kullanıcı başarıyla kaydedildi.", 201);
}, registerSchema);
