import { auth } from "@/auth";
import { cache } from "react";

export const getRequestSession = cache(() => auth());

/**
 * Server-side guard to strictly enforce that the active session belongs to an ADMIN.
 * Must be called inside every admin server action and route handler.
 */
export async function requireAdminSession() {
  const session = await getRequestSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to access admin functions.");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: You do not have administrator permissions.");
  }

  return session.user;
}
