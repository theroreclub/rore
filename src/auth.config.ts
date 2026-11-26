import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      const id = user?.id ?? token.id;
      if (typeof id !== "string") return null;
      const account = await prisma.user.findUnique({ where: { id }, select: { role: true } });
      if (!account) return null;
      token.id = id;
      token.role = account.role;
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [], // Initialized with database credentials in auth.ts
};
