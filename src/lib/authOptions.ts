import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { rateLimit } from "@/lib/rate-limit";
import { logLoginHistory } from "@/lib/auditLogger";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const ip = req?.headers?.["x-forwarded-for"] || "127.0.0.1";
          if (process.env.NODE_ENV !== 'development') {
            const { success } = await rateLimit(`auth:${ip}`, 5, 60 * 5);
            if (!success) {
              console.warn(`Rate limit exceeded for login attempt from ${ip}`);
              throw new Error("Too Many Attempts");
            }
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (user) {
            // Verify hashed password
            const passwordMatch = await bcrypt.compare(credentials.password, user.password);
            
            if (passwordMatch) {
              const ipAddress = typeof req?.headers?.["x-forwarded-for"] === 'string' ? req.headers["x-forwarded-for"] : "unknown";
              const userAgent = typeof req?.headers?.["user-agent"] === 'string' ? req.headers["user-agent"] : "unknown";
              
              await logLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                success: true,
              });

              try {
                await prisma.user.update({
                  where: { id: user.id },
                  data: { lastLogin: new Date() },
                });
              } catch (updateError) {
                console.error("Failed to update last login:", updateError);
              }

              return {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                phoneNumber: user.phoneNumber,
              };
            } else {
              const ipAddress = typeof req?.headers?.["x-forwarded-for"] === 'string' ? req.headers["x-forwarded-for"] : "unknown";
              const userAgent = typeof req?.headers?.["user-agent"] === 'string' ? req.headers["user-agent"] : "unknown";

              await logLoginHistory({
                userId: user.id,
                ipAddress,
                userAgent,
                success: false,
              });
              
              return null;
            }
          } else {
            // Mock admin user for development purposes
            if (credentials.email === "admin" && credentials.password === "123456") {
              let adminUser = await prisma.user.findUnique({
                where: { email: "admin@example.com" },
              });
              if (!adminUser) {
                const hashedPassword = await bcrypt.hash("123456", 10);
                adminUser = await prisma.user.create({
                  data: {
                    email: "admin@example.com",
                    password: hashedPassword,
                    role: "admin",
                  },
                });
              }
              return {
                id: adminUser.id.toString(),
                email: adminUser.email,
                role: adminUser.role,
              };
            }
          }
        } catch (error: any) {
          console.error("Auth error:", error);
          if (error.message === "Too Many Attempts") {
            throw error;
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 günlük JWT süresi
  },
  pages: {
    signIn: "/admin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.name = user.name;
        token.phoneNumber = (user as any).phoneNumber;
      }
      // Handle session updates from client-side update() calls
      if (trigger === "update" && updateData) {
        if (updateData.name !== undefined) token.name = updateData.name;
        if (updateData.email !== undefined) token.email = updateData.email;
        if (updateData.phoneNumber !== undefined) token.phoneNumber = updateData.phoneNumber;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow any localhost URL to support different development ports
      try {
        const urlOrigin = new URL(url).origin;
        if (urlOrigin.startsWith("http://localhost:")) return url;
        if (urlOrigin === baseUrl) return url;
      } catch (e) {
        return baseUrl;
      }
      return baseUrl;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).phoneNumber = token.phoneNumber;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_development",
};
