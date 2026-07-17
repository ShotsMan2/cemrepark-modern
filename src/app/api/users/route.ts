import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { userService } from "@/services/userService";

export const GET = apiHandler(async (req: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(req);
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const users = await userService.getUsers();
  return NextResponse.json(users);
});
