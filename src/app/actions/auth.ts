"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";
import { allowAuthAttempt } from "@/lib/auth-attempts";

export interface SignUpActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to register a new customer account.
 */
export async function signUpUser(formData: unknown): Promise<SignUpActionResult> {
  try {
    // 1. Validate payload with Zod
    const parsed = signUpSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid registration details";
      return { success: false, error: firstError };
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    if (!await allowAuthAttempt("signup", normalizedEmail)) {
      return { success: false, error: "Too many attempts. Please try again in 15 minutes." };
    }

    // 3. Hash password with bcrypt (12 salt rounds for strong security)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Create user with role CUSTOMER
    await prisma.user.createMany({
      skipDuplicates: true,
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("SignUp error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while creating your account. Please try again.",
    };
  }
}
