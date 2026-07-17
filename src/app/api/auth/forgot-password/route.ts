import { logger } from '@/lib/logger';
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Ideally use a shared prisma instance instead of instantiating it here to avoid many connections during development.
// For now, we keep the original logic but typed.
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email as string | undefined;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found for security reasons
      return NextResponse.json({ message: "If your email is registered, you will receive a password reset link." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Check if a token already exists and delete it
    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email }
    });
    if(existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expires: passwordResetExpires,
      },
    });

    // Generate reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // Log the link since we don't have an email provider
    logger.info("\n=========================================");
    logger.info(`PASSWORD RESET LINK FOR ${email}:`);
    logger.info(resetUrl);
    logger.info("=========================================\n");

    return NextResponse.json({ 
        message: "If your email is registered, you will receive a password reset link.",
        _devResetUrl: resetUrl // Passing this to frontend for testing
    });

  } catch (error) {
    logger.error("Forgot password error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
