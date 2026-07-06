import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { userService } from "@/services/userService";

export const DELETE = apiHandler(async (req, { params }) => {
  const { id } = params;
  const { errorResponse } = await checkAdminAndLog(req, "DELETE_USER", `Deleted user with ID ${id}`);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim");
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  await userService.deleteUser(id);
  return NextResponse.json({ success: true });
});
