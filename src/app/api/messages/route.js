import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { messageService } from "@/services/messageService";

export const GET = apiHandler(async (req) => {
  const { errorResponse } = await checkAdminAndLog(req, null, null);
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const messages = await messageService.getMessages();
  return NextResponse.json(messages);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const responseMessage = await messageService.createMessage(body);
  return NextResponse.json(responseMessage, { status: 201 });
});
