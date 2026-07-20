import { prisma } from "./prisma";

export interface ActiveSession {
  id: number;
  sessionToken: string;
  userId: number;
  expires: Date;
  user?: {
    name: string | null;
    email: string | null;
  };
}

export async function getActiveSessions(userId: number): Promise<ActiveSession[]> {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expires: { gt: new Date() },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { expires: "desc" },
    });
    return sessions;
  } catch (error) {
    console.error("[Session] Failed to get active sessions:", error);
    return [];
  }
}

export async function revokeSession(sessionId: number): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
    return true;
  } catch (error) {
    console.error("[Session] Failed to revoke session:", error);
    return false;
  }
}

export async function revokeAllSessions(userId: number, excludeSessionToken?: string): Promise<number> {
  try {
    const where: any = { userId };
    if (excludeSessionToken) {
      where.sessionToken = { not: excludeSessionToken };
    }
    const result = await prisma.session.deleteMany({ where });
    return result.count;
  } catch (error) {
    console.error("[Session] Failed to revoke all sessions:", error);
    return 0;
  }
}

export async function revokeSessionByToken(sessionToken: string): Promise<boolean> {
  try {
    await prisma.session.delete({
      where: { sessionToken },
    });
    return true;
  } catch (error) {
    console.error("[Session] Failed to revoke session by token:", error);
    return false;
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: { expires: { lt: new Date() } },
    });
    return result.count;
  } catch (error) {
    console.error("[Session] Failed to cleanup expired sessions:", error);
    return 0;
  }
}
