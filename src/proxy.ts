import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = new Set(["/", "/login", "/register", "/pending-approval", "/auth/callback"]);
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicStatic(pathname) || PUBLIC_ROUTES.has(pathname)) {
    return NextResponse.next();
  }

  const { user, response } = await updateSession(request);

  // Unauthenticated on a protected route goes to login.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (user) {
    const claims = (user.app_metadata ?? {}) as {
      role?: "admin" | "secretary" | "member";
      status?: "pending" | "active" | "suspended";
    };
    const role = claims.role ?? "member";
    const status = claims.status ?? "pending";

    if (status === "suspended" && pathname !== "/suspended") {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (status === "pending" && pathname !== "/pending-approval") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending-approval";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith(ADMIN_PREFIX) && role !== "admin" && role !== "secretary") {
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
