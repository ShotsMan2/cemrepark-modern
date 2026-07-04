import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (user) {
            // Verify hashed password
            const passwordMatch = await bcrypt.compare(credentials.password, user.password);
            if (passwordMatch) {
              return {
                id: user.id.toString(),
                email: user.email,
                role: user.role
              };
            }
          } else {
            // Mock admin user for development purposes
            if (credentials.email === "admin" && credentials.password === "123456") {
              return {
                id: "1",
                email: "admin@example.com",
                role: "admin"
              };
            }
          }
        } catch (error) {
          console.error("Auth error:", error);
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/admin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_key_for_development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
