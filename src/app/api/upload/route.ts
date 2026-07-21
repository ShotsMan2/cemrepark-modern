import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { uploadService } from "@/services/uploadService";

export const POST = apiHandler(async (req: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(req, "UPLOAD_FILE", "Uploaded a file");

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const formData = await req.formData();
  const file = formData.get("file");

  const result = await uploadService.uploadFile(file);
  return NextResponse.json(result);
});
