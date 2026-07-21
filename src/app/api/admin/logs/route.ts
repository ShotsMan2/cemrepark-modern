import { logger } from "@/lib/logger";
import { NextResponse, NextRequest } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { errorResponse } = await checkAdminAndLog(req, "VIEW_LOGS", "Güvenlik loglarını görüntüledi");
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "login";
  const take = parseInt(searchParams.get("take") || "50");
  const skip = parseInt(searchParams.get("skip") || "0");

  try {
    if (type === "login") {
      const logs = await prisma.loginHistory.findMany({
        take, skip,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true, role: true } } },
      });
      const total = await prisma.loginHistory.count();
      return NextResponse.json({ logs, total });
    } else {
      const logs = await prisma.auditLog.findMany({
        take, skip,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true, role: true } } },
      });
      const total = await prisma.auditLog.count();
      return NextResponse.json({ logs, total });
    }
  } catch (error) {
    logger.error("Log getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}