import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { pageService } from "@/services/pageService";

export const GET = apiHandler(async () => {
  const pages = await pageService.getPages();
  return NextResponse.json(pages);
});

export const POST = apiHandler(async (req: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(req, "CREATE_PAGE", `Created a new page`);
  
  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & { statusCode?: number; isOperational?: boolean };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const page = await pageService.createPage(body);
  return NextResponse.json(page, { status: 201 });
});
