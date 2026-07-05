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
              let adminUser = await prisma.user.findUnique({
                where: { email: "admin@example.com" }
              });
              if (!adminUser) {
                const hashedPassword = await bcrypt.hash("123456", 10);
                adminUser = await prisma.user.create({
                  data: {
                    email: "admin@example.com",
                    password: hashedPassword,
                    role: "admin"
                  }
                });
              }
              return {
                id: adminUser.id.toString(),
                email: adminUser.email,
                role: adminUser.role
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
