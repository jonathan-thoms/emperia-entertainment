import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── RBAC Proxy (Next.js 16) ─────────────────────────────────────────────────────
// Reads the __session_role cookie set by auth-context after login.
// Enforces route-level access control before the page renders.
//
// Roles: "admin" | "scanner" | "customer" | undefined
// ─────────────────────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("__session_role")?.value; // "admin" | "scanner" | "customer" | undefined

  // ── /admin/* — only admins allowed ──────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!role) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (role === "scanner") {
      // Staff scanners are strictly blocked from admin — redirect to their tool
      return NextResponse.redirect(new URL("/scanner", request.url));
    }
    if (role === "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // role === "admin" → allowed through
  }

  // ── /scanner — only scanners and admins allowed ────────────────────────────
  if (pathname.startsWith("/scanner")) {
    if (!role) {
      // Unauthenticated → dedicated staff login, not the customer login
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    if (role === "customer") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // role === "scanner" or "admin" → allowed through
  }

  // ── /staff/login — redirect if already authenticated ───────────────────────
  if (pathname.startsWith("/staff/login")) {
    if (role === "scanner") {
      // Already logged in as scanner → go straight to the tool
      return NextResponse.redirect(new URL("/scanner", request.url));
    }
    if (role === "admin") {
      // Admins don't need the staff login
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    // Unauthenticated or customer → show the staff login form
  }

  return NextResponse.next();
}

// Only run the proxy on protected routes — skip static assets, API, etc.
export const config = {
  matcher: ["/admin/:path*", "/scanner/:path*", "/staff/:path*"],
};
