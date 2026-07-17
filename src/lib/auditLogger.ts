import { prisma } from './prisma';

export interface AuditLogParams {
  action: string;
  userId?: number | null;
  details?: string | null;
  ipAddress?: string | null;
}

export interface LoginHistoryParams {
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  success: boolean;
}

/**
 * Reusable utility function to log admin actions to the AuditLog Prisma model.
 * Includes a try-catch block to ensure that if logging fails, it does not crash the main API flow.
 *
 * @param {AuditLogParams} params - The parameters for the audit log entry.
 */
export async function logAuditAction({
  action,
  userId,
  details,
  ipAddress,
}: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId ?? null,
        details: details ?? null,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (error) {
    // Log the error to the console instead of throwing, preventing main API crashes
    console.error('[AuditLogger] Failed to create audit log entry:', error);
  }
}

/**
 * Logs a login attempt into the LoginHistory table.
 *
 * @param {LoginHistoryParams} params
 */
export async function logLoginHistory({
  userId,
  ipAddress,
  userAgent,
  success,
}: LoginHistoryParams): Promise<void> {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        success,
      },
    });
  } catch (error) {
    console.error('[AuditLogger] Failed to create login history entry:', error);
  }
}
