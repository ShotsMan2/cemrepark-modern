import prisma from './prisma';

/**
 * Logs an administrative action into the AuditLog table.
 * 
 * @param {Object} params
 * @param {number} params.userId - The ID of the admin performing the action.
 * @param {string} params.action - Short description of the action (e.g., 'UPDATE_PRODUCT', 'DELETE_USER').
 * @param {string} [params.details] - Detailed JSON string or text about what changed.
 * @param {string} [params.ipAddress] - IP Address of the user (if available).
 */
export async function logAdminAction({ userId, action, details, ipAddress }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
