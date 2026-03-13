import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES } from "@/lib/constants/routes";
import { SESSION_COOKIE } from "@/lib/constants/app";
import type { Session } from "@/types/auth";

function readSession(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(raw)) as Session;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = readSession(request);
  const isAuthRoute = pathname.startsWith(ROUTES.login);
  const isAdminRoute = pathname.startsWith("/admin");
  const isClientAppRoute = ["/dashboard", "/configuration", "/account", "/runs"].some((path) =>
    pathname.startsWith(path),
  );

  if (pathname === ROUTES.home) {
    if (!session) {
      return NextResponse.redirect(new URL(ROUTES.login, request.url));
    }

    return NextResponse.redirect(
      new URL(session.user.role === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard, request.url),
    );
  }

  if (!session && (isAdminRoute || isClientAppRoute)) {
    return NextResponse.redirect(new URL(ROUTES.login, request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(
      new URL(session.user.role === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard, request.url),
    );
  }

  if (session && session.user.role !== "admin" && isAdminRoute) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/configuration/:path*", "/account/:path*", "/runs/:path*", "/admin/:path*"],
};
