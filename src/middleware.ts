import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = new Set(["/", "/login", "/register", "/auth/callback"]);
const ADMIN_PREFIX = "/admin";

export async function middleware(request: NextRequest) {
  const { user, response } = await updateSession(request);

  const { pathname, search } = request.nextUrl;

  // Authenticated users on landing/login/register → send to dashboard.
  if (user && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Unauthenticated on a protected route → /login.
  if (!user && !PUBLIC_ROUTES.has(pathname) && !isPublicStatic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Logged-in users: derive role + status from JWT app_metadata claims.
  if (user) {
    const claims = (user.app_metadata ?? {}) as {
      role?: "admin" | "member";
      status?: "pending" | "active" | "suspended";
    };
    const role = claims.role ?? "member";
    const status = claims.status ?? "pending";

    // Suspended users may only view /suspended.
    if (status === "suspended" && pathname !== "/suspended") {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Pending members can only be on /pending-approval (and their dashboard is gated by app shell).
    if (status === "pending" && pathname !== "/pending-approval") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending-approval";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // Admin gate.
    if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

function isPublicStatic(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static
     * - _next/image
     * - favicon
     * - public files (svg/png/etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};