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

/**
 * Logs a login attempt into the LoginHistory table.
 *
 * @param {Object} params
 * @param {number} params.userId - The ID of the user logging in.
 * @param {string} [params.ipAddress] - IP Address of the user (if available).
 * @param {string} [params.userAgent] - User agent string.
 * @param {boolean} params.success - Whether the login was successful.
 */
export async function logLoginHistory({ userId, ipAddress, userAgent, success }) {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success,
      },
    });
  } catch (error) {
    console.error('Failed to write login history:', error);
  }
}
