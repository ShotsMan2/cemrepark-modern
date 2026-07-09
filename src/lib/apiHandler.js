import { NextResponse } from "next/server";
import logger from "./logger";
import { ZodError } from "zod";

export function apiHandler(handler, schema = null) {
  return async (req, ...args) => {
    try {
      // Anti-CSRF Check for state-mutating methods
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const csrfToken = req.headers.get('x-csrf-token');
        // In a real scenario, compare this token with the one stored in session/cookie
        if (!csrfToken && process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: "CSRF token missing or invalid." }, { status: 403 });
        }
      }

      if (schema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        // We clone the request to read body without consuming it entirely
        const clonedReq = req.clone();
        const body = await clonedReq.json();
        schema.parse(body);
      }
      return await handler(req, ...args);
    } catch (error) {
      logger.error("API Error:", {
        url: req.url,
        method: req.method,
        message: error.message,
        stack: error.stack,
      });

      if (error instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation Error", details: error.errors },
          { status: 400 }
        );
      }

      const statusCode = error.statusCode || 500;
      const message = error.isOperational ? error.message : "Internal Server Error";

      return NextResponse.json({ error: message }, { status: statusCode });
    }
  };
}
