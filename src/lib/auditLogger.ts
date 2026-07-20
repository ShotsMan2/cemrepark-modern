import { prisma } from "./prisma";

export interface AuditLogParams {
  action: string;
  userId?: number | null;
  entity: string;
  entityId: string;
  details?: string | null;
}

export interface LoginHistoryParams {
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: string;
}

/**
 * Reusable utility function to log admin actions to the AuditLog Prisma model.
 * Includes a try-catch block to ensure that if logging fails, it does not crash the main API flow.
 */
export async function logAuditAction({
  action,
  userId,
  entity,
  entityId,
  details,
}: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? null,
        entity,
        entityId,
        details: details ?? null,
      },
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to create audit log entry:", error);
  }
}

/**
 * Logs a login attempt into the LoginHistory table.
 */
export async function logLoginHistory({
  userId,
  ipAddress,
  userAgent,
  status,
}: LoginHistoryParams): Promise<void> {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        status,
      },
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to create login history entry:", error);
  }
}
