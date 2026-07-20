import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logAuditAction } from "@/lib/auditLogger";

export async function checkAdminAndLog(
  req: NextRequest | Request | any,
  action?: string,
  details?: string
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    return {
      errorResponse: NextResponse.json({ error: "Yetkisiz Erişim" }, { status: 403 }),
      session: null,
    };
  }

  // Create audit log asynchronously in the background so it doesn't block
  if (action) {
    const userId = session.user?.id ? parseInt(session.user.id) : null;

    await logAuditAction({
      action,
      userId,
      entity: action,
      entityId: "N/A",
      details,
    });
  }

  return { errorResponse: null, session };
}
