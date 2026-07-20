import winston from "winston";
import prisma from "./prisma";

const { combine, timestamp, json, errors, splat } = winston.format;

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(errors({ stack: true }), timestamp(), splat(), json()),
  defaultMeta: { service: "cemrepark-api" },
  transports: [
    new winston.transports.Console({
      format: combine(errors({ stack: true }), timestamp(), json()),
    }),
  ],
});

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
    logger.error("Failed to insert AuditLog", error);
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
    logger.error("Failed to insert LoginHistory", error);
  }
};

export default logger;
