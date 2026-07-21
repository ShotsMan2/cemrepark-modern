import { prisma } from "./prisma";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface AuditLogParams {
  action: string;
  userId?: number | null;
  entity: string;
  entityId: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestPath?: string | null;
  level?: LogLevel;
}

export interface LoginHistoryParams {
  userId: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: string;
}

interface QueuedLog {
  params: AuditLogParams;
  timestamp: Date;
}

const logQueue: QueuedLog[] = [];
const BATCH_INTERVAL = 5000;
const BATCH_MAX_SIZE = 50;
let batchTimer: ReturnType<typeof setInterval> | null = null;

function startBatchProcessor() {
  if (batchTimer) return;
  batchTimer = setInterval(async () => {
    if (logQueue.length === 0) return;
    const batch = logQueue.splice(0, BATCH_MAX_SIZE);
    try {
      await prisma.auditLog.createMany({
        data: batch.map((entry) => ({
          action: entry.params.action,
          userId: entry.params.userId ?? null,
          entity: entry.params.entity,
          entityId: entry.params.entityId,
          details: JSON.stringify({
            ...(entry.params.details ? { message: entry.params.details } : {}),
            ...(entry.params.ipAddress ? { ip: entry.params.ipAddress } : {}),
            ...(entry.params.userAgent ? { ua: entry.params.userAgent } : {}),
            ...(entry.params.requestPath ? { path: entry.params.requestPath } : {}),
            level: entry.params.level || LogLevel.INFO,
            loggedAt: entry.timestamp.toISOString(),
          }),
        })),
      });
    } catch (error) {
      console.error("[AuditLogger] Batch insert failed:", error);
    }
  }, BATCH_INTERVAL);
}

function enqueueLog(params: AuditLogParams) {
  logQueue.push({ params, timestamp: new Date() });
  if (logQueue.length >= BATCH_MAX_SIZE) {
    const copy = logQueue.splice(0, BATCH_MAX_SIZE);
    prisma.auditLog
      .createMany({
        data: copy.map((entry) => ({
          action: entry.params.action,
          userId: entry.params.userId ?? null,
          entity: entry.params.entity,
          entityId: entry.params.entityId,
          details: JSON.stringify({
            ...(entry.params.details ? { message: entry.params.details } : {}),
            ...(entry.params.ipAddress ? { ip: entry.params.ipAddress } : {}),
            ...(entry.params.userAgent ? { ua: entry.params.userAgent } : {}),
            ...(entry.params.requestPath ? { path: entry.params.requestPath } : {}),
            level: entry.params.level || LogLevel.INFO,
            loggedAt: entry.timestamp.toISOString(),
          }),
        })),
      })
      .catch((error) => {
        console.error("[AuditLogger] Batch flush failed:", error);
      });
  }
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    startBatchProcessor();
    enqueueLog(params);
  } catch (error) {
    console.error("[AuditLogger] Failed to enqueue audit log:", error);
  }
}

export async function logAuditAction(params: AuditLogParams): Promise<void> {
  return createAuditLog(params);
}

export async function logLoginHistory(params: LoginHistoryParams): Promise<void> {
  try {
    await prisma.loginHistory.create({
      data: {
        userId: params.userId,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        status: params.status,
      },
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to create login history entry:", error);
  }
}

export async function getRecentActivity(
  userId: number,
  limit = 20,
  offset = 0
): Promise<{ logs: any[]; total: number }> {
  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where: { userId } }),
    ]);
    return { logs, total };
  } catch (error) {
    console.error("[AuditLogger] Failed to fetch recent activity:", error);
    return { logs: [], total: 0 };
  }
}

export async function getAuditSummary(): Promise<{
  totalActions: number;
  todayActions: number;
  thisWeekActions: number;
  thisMonthActions: number;
  byAction: Record<string, number>;
  byLevel: Record<string, number>;
}> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalActions, todayActions, thisWeekActions, thisMonthActions, actionGroups, levelGroups] =
      await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.auditLog.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.auditLog.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.auditLog.groupBy({ by: ["action"], _count: { _all: true } }),
        Promise.resolve([] as any[]),
      ]);

    const byAction: Record<string, number> = {};
    actionGroups.forEach((g) => {
      byAction[g.action] = g._count._all;
    });

    const allLogs = await prisma.auditLog.findMany({
      select: { details: true },
      where: { createdAt: { gte: startOfMonth } },
    });
    const byLevel: Record<string, number> = {};
    allLogs.forEach((log) => {
      try {
        const parsed = JSON.parse(log.details || "{}");
        const level = parsed.level || "INFO";
        byLevel[level] = (byLevel[level] || 0) + 1;
      } catch {
        byLevel["INFO"] = (byLevel["INFO"] || 0) + 1;
      }
    });

    return { totalActions, todayActions, thisWeekActions, thisMonthActions, byAction, byLevel };
  } catch (error) {
    console.error("[AuditLogger] Failed to get summary:", error);
    return {
      totalActions: 0,
      todayActions: 0,
      thisWeekActions: 0,
      thisMonthActions: 0,
      byAction: {},
      byLevel: {},
    };
  }
}

export async function cleanupOldLogs(retentionDays = 90): Promise<number> {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    const loginResult = await prisma.loginHistory.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count + loginResult.count;
  } catch (error) {
    console.error("[AuditLogger] Cleanup failed:", error);
    return 0;
  }
}

export async function getLoginStatsByHour(
  hoursBack = 24
): Promise<{ hour: string; success: number; failed: number }[]> {
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursBack);
    const logs = await prisma.loginHistory.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { createdAt: true, status: true },
    });
    const hourMap: Record<string, { success: number; failed: number }> = {};
    for (let i = 0; i < hoursBack; i++) {
      const d = new Date(cutoff.getTime() + i * 3600000);
      const key = d.toISOString().slice(0, 13) + ":00";
      hourMap[key] = { success: 0, failed: 0 };
    }
    logs.forEach((log) => {
      const key = new Date(log.createdAt).toISOString().slice(0, 13) + ":00";
      if (hourMap[key]) {
        if (log.status === "SUCCESS") hourMap[key].success++;
        else hourMap[key].failed++;
      }
    });
    return Object.entries(hourMap).map(([hour, counts]) => ({
      hour,
      success: counts.success,
      failed: counts.failed,
    }));
  } catch (error) {
    console.error("[AuditLogger] Failed to get login stats by hour:", error);
    return [];
  }
}

export async function getFailedLoginIPs(
  minAttempts = 5,
  withinHours = 24
): Promise<{ ip: string; attempts: number; lastAttempt: Date }[]> {
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - withinHours);
    const failedLogins = await prisma.loginHistory.findMany({
      where: {
        status: { not: "SUCCESS" },
        createdAt: { gte: cutoff },
      },
      select: { ipAddress: true, createdAt: true },
    });
    const ipMap = new Map<string, { count: number; last: Date }>();
    failedLogins.forEach((log) => {
      if (!log.ipAddress) return;
      const existing = ipMap.get(log.ipAddress) || { count: 0, last: log.createdAt };
      existing.count++;
      if (log.createdAt > existing.last) existing.last = log.createdAt;
      ipMap.set(log.ipAddress, existing);
    });
    return Array.from(ipMap.entries())
      .filter(([, data]) => data.count >= minAttempts)
      .map(([ip, data]) => ({ ip, attempts: data.count, lastAttempt: data.last }));
  } catch (error) {
    console.error("[AuditLogger] Failed to get failed login IPs:", error);
    return [];
  }
}
