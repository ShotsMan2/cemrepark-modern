import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { pageService } from "@/services/pageService";

export const GET = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const page = await pageService.getPageById(resolvedParams.id);
    return NextResponse.json(page);
  }
);

export const PUT = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const { errorResponse } = await checkAdminAndLog(
      req,
      "UPDATE_PAGE",
      `Updated page with ID ${resolvedParams.id}`
    );

    if (errorResponse) {
      const error = new Error("Yetkisiz Erişim") as Error & {
        statusCode?: number;
        isOperational?: boolean;
      };
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const body = await req.json();
    const page = await pageService.updatePage(resolvedParams.id, body);
    return NextResponse.json(page);
  }
);

export const DELETE = apiHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    const { errorResponse } = await checkAdminAndLog(
      req,
      "DELETE_PAGE",
      `Deleted page with ID ${resolvedParams.id}`
    );

    if (errorResponse) {
      const error = new Error("Yetkisiz Erişim") as Error & {
        statusCode?: number;
        isOperational?: boolean;
      };
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    const result = await pageService.deletePage(resolvedParams.id);
    return NextResponse.json(result);
  }
);
