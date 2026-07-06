import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { emailService } from "@/services/emailService";

export const POST = apiHandler(async (request) => {
  const { errorResponse } = await checkAdminAndLog(request, "SEND_EMAIL", "Sent an email");
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await request.json();
  const { to, subject, message } = body;

  const result = await emailService.sendEmail(to, subject, message);
  return NextResponse.json(result);
});
