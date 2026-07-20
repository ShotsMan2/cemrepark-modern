import { NextRequest, NextResponse } from "next/server";
import logger from "./logger";
import { ZodError, ZodSchema } from "zod";

export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface CorsOptions {
  origin?: string;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

interface HandlerOptions {
  cors?: CorsOptions;
  cache?: { public?: boolean; maxAge?: number; sMaxAge?: number };
  rateLimit?: { limit?: number; windowMs?: number };
}

type HandlerFn<T = unknown> = (
  req: NextRequest,
  context: { params?: Promise<Record<string, string>> }
) => Promise<T> | T;

type RouteContext = { params?: Promise<Record<string, string>> };

function getCorsHeaders(options?: CorsOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  headers["Access-Control-Allow-Origin"] = options?.origin || "*";
  headers["Access-Control-Allow-Methods"] = (options?.methods || ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]).join(", ");
  headers["Access-Control-Allow-Headers"] = (options?.allowedHeaders || ["Content-Type", "Authorization", "x-csrf-token"]).join(", ");
  if (options?.credentials) headers["Access-Control-Allow-Credentials"] = "true";
  return headers;
}

function getCacheHeaders(options?: HandlerOptions["cache"]): Record<string, string> {
  if (!options) return {};
  const directives: string[] = [];
  if (options.public) directives.push("public");
  else directives.push("private");
  if (options.maxAge) directives.push(`max-age=${options.maxAge}`);
  if (options.sMaxAge) directives.push(`s-maxage=${options.sMaxAge}`);
  return { "Cache-Control": directives.join(", ") };
}

function getTimingHeaders(start: number): Record<string, string> {
  const duration = Date.now() - start;
  return {
    "X-Response-Time": `${duration}ms`,
    "X-Request-Id": `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

function handleError(error: unknown, start: number): NextResponse {
  const duration = Date.now() - start;

  if (error instanceof ZodError) {
    logger.warn("Validation Error", {
      issues: error.issues,
      duration,
    });
    return NextResponse.json(
      { success: false, message: "Validation Error", errors: error.issues },
      { status: 400, headers: { "X-Response-Time": `${duration}ms` } }
    );
  }

  if (error instanceof ApiError) {
    logger.error(`API Error: ${error.message}`, {
      statusCode: error.statusCode,
      details: error.details,
      duration,
    });
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode, headers: { "X-Response-Time": `${duration}ms` } }
    );
  }

  const err = error as Error;
  logger.error("Unhandled Error", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    duration,
  });

  return NextResponse.json(
    {
      success: false,
      message: "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { error: err.message }),
    },
    { status: 500, headers: { "X-Response-Time": `${duration}ms` } }
  );
}

export function createHandler<T>(
  handler: HandlerFn<T>,
  schema?: ZodSchema,
  options?: HandlerOptions
) {
  return async (req: NextRequest, context: RouteContext): Promise<NextResponse> => {
    const start = Date.now();

    if (req.method === "OPTIONS") {
      return NextResponse.json(null, {
        status: 204,
        headers: getCorsHeaders(options?.cors),
      });
    }

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      const csrfToken = req.headers.get("x-csrf-token");
      if (!csrfToken && process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, message: "CSRF token missing or invalid." },
          { status: 403, headers: getTimingHeaders(start) }
        );
      }
    }

    try {
      if (schema && ["POST", "PUT", "PATCH"].includes(req.method)) {
        const clonedReq = req.clone();
        const body = await clonedReq.json();
        schema.parse(body);
      }

      const result = await handler(req, context);
      const headers: Record<string, string> = {
        ...getCorsHeaders(options?.cors),
        ...getCacheHeaders(options?.cache),
        ...getTimingHeaders(start),
      };

      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json(result, { headers });
    } catch (error) {
      return handleError(error, start);
    }
  };
}

export function withValidation<T>(
  handler: HandlerFn<T>,
  schema: ZodSchema
): HandlerFn<T> {
  return async (req: NextRequest, context: RouteContext) => {
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      schema.parse(body);
    }
    return handler(req, context);
  };
}

export { createHandler as apiHandler };

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") === "asc" ? "asc" : "desc";
  const skip = (page - 1) * limit;
  return { page, limit, skip, sortBy, sortOrder };
}
