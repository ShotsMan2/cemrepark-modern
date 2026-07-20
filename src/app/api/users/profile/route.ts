import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { apiHandler } from "@/lib/apiHandler";
import { userService } from "@/services/userService";
import prisma from "@/lib/prisma";

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    const error = new Error("Oturum açmanız gerekiyor.") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      role: true,
    },
  });

  if (!user) {
    const error = new Error("Kullanıcı bulunamadı.") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  return NextResponse.json({ user });
});

export const PUT = apiHandler(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    const error = new Error("Oturum açmanız gerekiyor.") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 401;
    error.isOperational = true;
    throw error;
  }

  // Get the user from db to get their ID, since session.user might only have email/name
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    const error = new Error("Kullanıcı bulunamadı.") as Error & {
      statusCode?: number;
      isOperational?: boolean;
    };
    error.statusCode = 404;
    error.isOperational = true;
    throw error;
  }

  const body = await req.json();
  const { name, email, phoneNumber, password } = body;

  const result = await userService.updateProfile(currentUser.id, {
    name,
    email,
    phoneNumber,
    password,
  });

  const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "unknown";

  await import("@/lib/auditLogger").then(({ logAuditAction }) =>
    logAuditAction({
      action: "UPDATE_PROFILE",
      userId: currentUser.id,
      entity: "User",
      entityId: currentUser.id.toString(),
      details: `User updated their profile.`,
      changes: JSON.stringify({ name, email, phoneNumber }),
      ipAddress,
      userAgent,
    })
  );

  return NextResponse.json(result);
});
