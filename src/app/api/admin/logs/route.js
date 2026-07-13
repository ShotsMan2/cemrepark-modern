import { NextResponse } from "next/server";
import { checkAdminAndLog } from "@/lib/adminAuth";
import { apiHandler } from "@/lib/apiHandler";
import prisma from "@/lib/prisma";

export const GET = apiHandler(async (req) => {
  const { errorResponse } = await checkAdminAndLog(req, "VIEW_LOGS", "Güvenlik loglarını görüntüledi");
  if (errorResponse) return errorResponse;

  // Get query params for pagination
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "login"; // login or audit
  const take = parseInt(searchParams.get("take") || "50");
  const skip = parseInt(searchParams.get("skip") || "0");

  try {
    if (type === "login") {
      const logs = await prisma.loginHistory.findMany({
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true, role: true } } },
      });
      const total = await prisma.loginHistory.count();
      return NextResponse.json({ logs, total });
    } else {
      const logs = await prisma.auditLog.findMany({
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true, role: true } } },
      });
      const total = await prisma.auditLog.count();
      return NextResponse.json({ logs, total });
    }
  } catch (error) {
    console.error("Log getirme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
});
