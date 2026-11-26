import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Protected pages and actions verify the session and current database role.
  const hasSessionCookie = request.cookies.getAll().some(
    ({ name, value }) => /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?$/.test(name) && value.length > 0,
  );
  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"],
};
