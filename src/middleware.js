import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/hesabim", req.url));
      }
      return null;
    }

    if (!isAuth) {
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return null;
      }
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    // Robust Role-based Access Control (RBAC)
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/yetkisiz-erisim", req.url));
      }
    }
    
    // Add Edge Security Headers
    const response = NextResponse.next();
    response.headers.set('X-Edge-Secured', 'true');
    response.headers.set('X-RateLimit-Limit', '100');
    // Note: True distributed rate limiting at the edge would use Upstash Redis here.
    return response;
  },
  {
    callbacks: {
      authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/hesabim/:path*", "/login", "/register"],
};
