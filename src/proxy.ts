import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const userRole = req.auth?.user?.role;

  const isAccountRoute = nextUrl.pathname.startsWith("/account");
  const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Protect /account and /checkout for authenticated users
  if (isAccountRoute || isCheckoutRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /admin exclusively for ADMIN role
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (userRole !== "ADMIN") {
      // Forbidden: redirect non-admin back to home
      return NextResponse.redirect(new URL("/", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/admin/:path*",
  ],
};
