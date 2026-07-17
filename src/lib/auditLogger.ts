import { prisma } from './prisma';

export interface AuditLogParams {
  action: string;
  userId?: number | null;
  details?: string | null;
  ipAddress?: string | null;
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
