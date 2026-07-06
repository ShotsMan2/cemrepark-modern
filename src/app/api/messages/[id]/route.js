import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { messageService } from "@/services/messageService";

export const DELETE = apiHandler(async (request, { params }) => {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const { errorResponse } = await checkAdminAndLog(
    request,
    "DELETE_MESSAGE",
    `Deleted message with ID ${id}`
  );

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const result = await messageService.deleteMessage(id);
  return NextResponse.json(result);
});
