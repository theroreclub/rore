import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "./auth.config";
import { allowAuthAttempt } from "@/lib/auth-attempts";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        if (!await allowAuthAttempt("login", email)) return null;

        // Lookup user by lowercase email
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // Always use generic failure; never expose whether user exists or not
        const hash = user?.passwordHash ?? "$2b$12$Yl7l2ejJnKdHkG1hGWX5ZuFFKXsGlPJTUd3AVKd12mMa7FAcNxpCO";
        const isPasswordValid = await bcrypt.compare(password, hash);
        if (!user?.passwordHash || !isPasswordValid) {
          return null;
        }

        // Return user without sensitive credentials
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
