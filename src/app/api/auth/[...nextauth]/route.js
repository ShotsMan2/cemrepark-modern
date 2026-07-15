import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const handler = NextAuth(authOptions);

const wrappedPost = async (req, ctx) => {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success } = await rateLimit(`auth:${ip}`, 5, 60 * 5); // 5 requests per 5 minutes for Auth
  if (!success) {
    return NextResponse.json({ error: "Too Many Attempts" }, { status: 429 });
  }
  return handler(req, ctx);
};

export { handler as GET, wrappedPost as POST };
