import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const memoryCache = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of memoryCache.entries()) {
    if (record.resetTime < now) {
      memoryCache.delete(key);
    }
  }
}, 60000);

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
  };
}

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
  return response;
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

  if (
    (path.startsWith("/api/auth") &&
      req.method !== "GET" &&
      !path.includes("/signout") &&
      !path.includes("/register") &&
      !path.includes("/callback")) ||
    path.startsWith("/api/orders") ||
    path.startsWith("/api/chat")
  ) {
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    try {
      const { success } = await edgeRateLimit(ip, 20, 60);
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: "Too Many Requests", message: "Hız limiti aşıldı." }),
          { status: 429, headers: { "content-type": "application/json" } }
        );
      }
    } catch (e) {
      console.warn("Rate limit middleware error:", e);
    }
  }

  const authRoutes = ["/admin", "/api/admin", "/hesabim", "/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => path === route || path.startsWith(`${route}/`));

  if (isAuthRoute) {
    return await authMiddleware(req);
  }

  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
