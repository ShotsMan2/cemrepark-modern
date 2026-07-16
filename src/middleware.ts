import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple Edge-compatible in-memory rate limiting
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

// NextAuth middleware'ini sadece korunması gereken rotalar için tanımlıyoruz
async function authMiddleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_development" });
  const isAuth = !!token;
  const path = req.nextUrl.pathname;
  const isAuthPage = path === "/login" || path.startsWith("/login/") || path === "/register" || path.startsWith("/register/");

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/hesabim", req.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    if (path.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (path.startsWith("/admin")) {
      if (path === "/admin") {
        return NextResponse.next();
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

  // Robust Role-based Access Control (RBAC)
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (token?.role !== "admin") {
      if (path.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/yetkisiz-erisim", req.url));
    }
  }
  
  // Add Edge Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Edge-Secured', 'true');
  response.headers.set('X-RateLimit-Limit', '100');
  return response;
}

export default async function middleware(req: NextRequest, event: any) {
  const path = req.nextUrl.pathname;
  
  // 1. Rate Limit Check (Runs for /api/auth non-GET requests and /api/orders, excludes signout, register, and callback)
  if ((path.startsWith('/api/auth') && req.method !== 'GET' && !path.includes('/signout') && !path.includes('/register') && !path.includes('/callback')) || path.startsWith('/api/orders')) {
    const ip = req.headers.get('x-forwarded-for') || (req as any).ip || '127.0.0.1';
    try {
      const { success } = await edgeRateLimit(ip, 20, 60);
      if (!success) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests', message: 'Hız limiti aşıldı.' }),
          { status: 429, headers: { 'content-type': 'application/json' } }
        );
      }
    } catch (e) {
      console.warn("Rate limit middleware error:", e);
    }
  }

  // 2. Sadece yetki gerektiren rotalarda NextAuth middleware'ini çalıştır
  const authRoutes = ["/admin", "/api/admin", "/hesabim", "/login", "/register"];
  const isAuthRoute = authRoutes.some(route => path === route || path.startsWith(`${route}/`));

  if (isAuthRoute) {
    return await authMiddleware(req);
  }

  // NextAuth rotası değilse yola devam et (örneğin /api/auth/session)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*", 
    "/hesabim/:path*", 
    "/login", 
    "/register",
    "/api/auth/:path*", 
    "/api/orders/:path*"
  ],
};
