import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import { userService } from "@/services/userService";

export const GET = apiHandler(async (req: NextRequest) => {
  const { errorResponse } = await checkAdminAndLog(req);

  if (errorResponse) {
    const error = new Error("Yetkisiz Erişim") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 403;
    error.isOperational = true;
    throw error;
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const page = searchParams.get("page");

  if (page) {
    const pageNum = parseInt(page) || 1;
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    const filters = { search, role };

    const paginatedUsers = await userService.getUsersPaginated(
      filters,
      pageNum,
      limit,
      sortBy,
      sortOrder
    );
    return NextResponse.json(paginatedUsers);
  }

  const users = await userService.getUsers();
  return NextResponse.json(users);
});
