import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRateLimiter } from "./lib/rate-limit";
import { createAuditLog, LogLevel } from "./lib/auditLogger";

const memoryCache = new Map<string, { count: number; resetTime: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryCache.entries()) {
    if (record.resetTime < now) {
      memoryCache.delete(key);
    }
  }
}, 60000);

const KNOWN_BAD_BOTS = new Set([
  "curl", "wget", "scrapy", "python-requests", "go-http-client",
  "masscan", "nmap", "acunetix", "nikto", "sqlmap",
  "zgrab", "whatweb", "netsparker", "burpsuite", "openvas",
]);

const MAX_BODY_SIZE = 1024 * 100;
const WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

let maintenanceMode = false;
if (process.env.MAINTENANCE_MODE === "true") {
  maintenanceMode = true;
}

async function edgeRateLimit(ip: string, limit: number, windowSec: number) {
  const now = Date.now();
  const key = `rate-limit:${ip}`;
  let record = memoryCache.get(key);
  if (!record || record.resetTime < now) {
    record = { count: 0, resetTime: now + windowSec * 1000 };
  }
  record.count += 1;
  memoryCache.set(key, record);
  return {
    success: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}

const endpointRateLimiter = createRateLimiter({ limit: 100, windowMs: 60000 });

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss: ws:; frame-src 'self' https:;"
  );
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Content-Security-Policy", "default-src 'self'");
  return response;
}

function checkSecurityHeaders(headers: Headers): string[] {
  const missing: string[] = [];
  const required = [
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
    "strict-transport-security",
    "content-security-policy",
  ];
  for (const h of required) {
    if (!headers.get(h)) missing.push(h);
  }
  return missing;
}

function detectBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  for (const bot of KNOWN_BAD_BOTS) {
    if (ua.includes(bot)) return true;
  }
  return false;
}

function sanitizeQueryParams(url: URL): URL {
  const sanitized = new URL(url.toString());
  for (const [key, value] of sanitized.searchParams.entries()) {
    const cleaned = value.replace(/[<>"';&()]/g, "").slice(0, 500);
    if (cleaned !== value) {
      sanitized.searchParams.set(key, cleaned);
    }
  }
  return sanitized;
}

async function logRequest(req: NextRequest, status: number, durationMs: number) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";
  const path = req.nextUrl.pathname;
  try {
    await createAuditLog({
      action: `${req.method} ${path}`,
      entity: "request",
      entityId: path,
      details: `Status: ${status}, Duration: ${durationMs}ms`,
      ipAddress: ip,
      userAgent,
      requestPath: path,
      level: status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO,
    });
  } catch {
    // Non-blocking
  }
}

async function authMiddleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_development",
  });
  const isAuth = !!token;
  const path = req.nextUrl.pathname;
  const isAuthPage =
    path === "/login" ||
    path.startsWith("/login/") ||
    path === "/register" ||
    path.startsWith("/register/");

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/hesabim", req.url));
    }
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  if (!isAuth) {
    if (path.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (path.startsWith("/admin")) {
      if (path === "/admin") {
        const response = NextResponse.next();
        return applySecurityHeaders(response);
      }
      let from = path;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/admin?from=${encodeURIComponent(from)}`, req.url));
    }

    let from = path;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
  }

  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (token?.role !== "admin") {
      if (path.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/yetkisiz-erisim", req.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("X-Edge-Secured", "true");
  response.headers.set("X-RateLimit-Limit", "100");
  return applySecurityHeaders(response);
}

export async function proxy(req: NextRequest, event: any) {
  const path = req.nextUrl.pathname;
  const startTime = Date.now();

  if (maintenanceMode && !path.startsWith("/api/auth") && !path.startsWith("/admin")) {
    return new NextResponse(
      JSON.stringify({ error: "Bakım Modu", message: "Sistem bakımda, kısa süre sonra tekrar deneyin." }),
      { status: 503, headers: { "content-type": "application/json", "retry-after": "300" } }
    );
  }

  const userAgent = req.headers.get("user-agent") || "";
  if (detectBot(userAgent)) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden", message: "Erişim engellendi." }),
      { status: 403, headers: { "content-type": "application/json" } }
    );
  }

  const contentType = req.headers.get("content-type") || "";
  if (WRITE_METHODS.includes(req.method) && contentType.includes("application/json")) {
    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      return new NextResponse(
        JSON.stringify({ error: "Payload Too Large", message: "İstek boyutu çok büyük." }),
        { status: 413, headers: { "content-type": "application/json" } }
      );
    }
  }

  const sanitizedUrl = sanitizeQueryParams(req.nextUrl);
  if (sanitizedUrl.toString() !== req.url) {
    const response = NextResponse.redirect(sanitizedUrl);
    return applySecurityHeaders(response);
  }

  const missingHeaders = checkSecurityHeaders(req.headers);
  if (WRITE_METHODS.includes(req.method) && missingHeaders.length > 0) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await createAuditLog({
      action: "MISSING_SECURITY_HEADERS",
      entity: "request",
      entityId: path,
      details: `Missing: ${missingHeaders.join(", ")}`,
      ipAddress: ip,
      userAgent,
      requestPath: path,
      level: LogLevel.WARN,
    });
  }

  if (
    (path.startsWith("/api/auth") && req.method !== "GET" && !path.includes("/signout") && !path.includes("/register") && !path.includes("/callback")) ||
    path.startsWith("/api/orders") ||
    path.startsWith("/api/chat")
  ) {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    try {
      const { success, remaining, reset } = await edgeRateLimit(ip, 20, 60);
      if (!success) {
        const response = new NextResponse(
          JSON.stringify({ error: "Too Many Requests", message: "Hız limiti aşıldı." }),
          { status: 429, headers: { "content-type": "application/json" } }
        );
        response.headers.set("X-RateLimit-Limit", "20");
        response.headers.set("X-RateLimit-Remaining", String(remaining));
        response.headers.set("X-RateLimit-Reset", String(reset));
        response.headers.set("Retry-After", String(reset));
        return response;
      }
    } catch (e) {
      console.warn("Rate limit middleware error:", e);
    }
  }

  if (WRITE_METHODS.includes(req.method)) {
    const csrfToken = req.headers.get("x-csrf-token");
    const csrfCookie = req.cookies.get("csrf-token")?.value;
    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      if (process.env.NODE_ENV === "production" && !path.startsWith("/api/auth/callback")) {
        return new NextResponse(
          JSON.stringify({ error: "CSRF token missing or invalid." }),
          { status: 403, headers: { "content-type": "application/json" } }
        );
      }
    }
  }

  const authRoutes = ["/admin", "/api/admin", "/hesabim", "/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`));

  let response: NextResponse;
  if (isAuthRoute) {
    response = await authMiddleware(req);
  } else {
    response = NextResponse.next();
    response = applySecurityHeaders(response);
  }

  const duration = Date.now() - startTime;
  if (duration > 1000) {
    await logRequest(req, response.status, duration);
  }

  return response;
}

export async function upgradeWebSocket(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/ws") || path.startsWith("/api/chat")) {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    try {
      const { success } = await edgeRateLimit(`ws:${ip}`, 5, 60);
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too Many WebSocket Requests" }),
          { status: 429, headers: { "content-type": "application/json" } }
        );
      }
    } catch {
      // fall through
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
