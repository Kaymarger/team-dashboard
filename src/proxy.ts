import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  TEAM_SESSION_COOKIE,
  isValidSession,
  safeNextPath,
  teamPassword,
} from "@/lib/auth";

function isLogin(pathname: string) {
  return pathname === "/login" || pathname.startsWith("/login/");
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const password = teamPassword();
  const authed = Boolean(
    password &&
      isValidSession(request.cookies.get(TEAM_SESSION_COOKIE)?.value, password),
  );

  if (isLogin(pathname)) {
    if (!authed) return NextResponse.next();
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    if (!password) {
      return NextResponse.json(
        { error: "Sign-in is not set up yet." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  if (!password) loginUrl.searchParams.set("setup", "1");
  const dest = `${pathname}${search}`;
  if (dest !== "/") loginUrl.searchParams.set("next", dest);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
