import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function checkAdminAndLog(req, action, details) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      errorResponse: NextResponse.json({ error: "Yetkisiz Erişim" }, { status: 403 }),
      session: null,
    };
  }

  // Create audit log asynchronously in the background so it doesn't block
  if (action) {
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
    const userId = session.user.id ? parseInt(session.user.id) : null;

    // We only await it if we want to ensure it completes before sending response,
    // but usually fire-and-forget is fine. Let's await it to be safe.
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          details: details || null,
          ipAddress,
        },
      });
    } catch (err) {
      console.error("AuditLog creation failed:", err);
    }
  }

  return { errorResponse: null, session };
}
