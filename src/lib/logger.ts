import crypto from "crypto";
import winston from "winston";
import fs from "fs";
import path from "path";
import prisma from "./prisma";

const { combine, timestamp, json, errors, splat, printf, colorize, align } = winston.format;

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch {
    // Ignore
  }
}

function getDailyFilename(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return path.join(logDir, `app-${y}-${m}-${d}.log`);
}

function getErrorFilename(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return path.join(logDir, `error-${y}-${m}-${d}.log`);
}

const consoleFormat = combine(
  colorize(),
  printf(({ level, message, timestamp, requestId, duration, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : "";
    const dur = duration != null ? ` (${duration}ms)` : "";
    const metaStr = Object.keys(meta).length > 2 ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp}${rid} ${level}: ${message}${dur}${metaStr}`;
  })
);

const jsonFormat = combine(errors({ stack: true }), timestamp(), splat(), json());

function is404Error(meta: any): boolean {
  if (meta?.statusCode === 404) return true;
  if (meta?.message && typeof meta.message === "string" && meta.message.includes("404")) return true;
  return false;
}

const errorFilter = winston.format((info) => {
  if (is404Error(info) && info.level === "error") {
    info.level = "warn";
  }
  return info;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: jsonFormat,
  defaultMeta: { service: "cemrepark-api" },
  transports: [
    new winston.transports.Console({
      format: combine(errorFilter(), consoleFormat),
    }),
    new winston.transports.File({
      filename: getDailyFilename(),
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30,
    }),
    new winston.transports.File({
      filename: getErrorFilename(),
      level: "error",
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30,
    }),
  ],
});

export function withRequestId(meta: Record<string, any> = {}): Record<string, any> {
  return {
    ...meta,
    requestId: meta.requestId || crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

export function logTiming(name: string, durationMs: number, meta: Record<string, any> = {}) {
  logger.info(`${name} completed`, {
    ...meta,
    duration: durationMs,
    timingName: name,
  });
}

export async function logPerformance(query: string, durationMs: number, meta: Record<string, any> = {}) {
  if (durationMs > 500) {
    logger.warn(`Slow operation detected`, {
      query,
      duration: durationMs,
      ...meta,
    });
  }
}

export const logAudit = async ({
  userId,
  action,
  entity,
  entityId,
  details,
}: {
  userId?: number;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
      },
    });
  } catch (error) {
    logger.error("Failed to insert AuditLog", { error });
  }
};

export const logLoginHistory = async ({
  userId,
  ipAddress,
  userAgent,
  status,
}: {
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  status: string;
}) => {
  try {
    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        status,
      },
    });
  } catch (error) {
    logger.error("Failed to insert LoginHistory", { error });
  }
};

export default logger;
