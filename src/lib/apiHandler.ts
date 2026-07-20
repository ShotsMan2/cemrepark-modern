import { NextRequest } from "next/server";
import logger from "./logger";
import { ZodError, ZodSchema } from "zod";
import { errorResponse } from "@/utils/apiResponse";

type HandlerFn = (req: NextRequest, ...args: any[]) => Promise<Response> | Response;

export function apiHandler(handler: HandlerFn, schema?: ZodSchema<any> | null) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      // Anti-CSRF Check for state-mutating methods
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
        const csrfToken = req.headers.get("x-csrf-token");
        // In a real scenario, compare this token with the one stored in session/cookie
        if (!csrfToken && process.env.NODE_ENV === "production") {
          return errorResponse("CSRF token missing or invalid.", undefined, 403);
        }
      }

      if (schema && ["POST", "PUT", "PATCH"].includes(req.method)) {
        // We clone the request to read body without consuming it entirely
        const clonedReq = req.clone();
        const body = await clonedReq.json();
        schema.parse(body);
      }
      return await handler(req, ...args);
    } catch (error: any) {
      logger.error("API Error:", {
        url: req.url,
        method: req.method,
        message: error.message,
        stack: error.stack,
      });

      if (error instanceof ZodError) {
        return errorResponse("Validation Error", error.issues, 400);
      }

      const statusCode = error.statusCode || 500;
      const message = error.isOperational ? error.message : "Internal Server Error";

      return errorResponse(
        message,
        process.env.NODE_ENV === "development" ? error : undefined,
        statusCode
      );
    }
  };
}
