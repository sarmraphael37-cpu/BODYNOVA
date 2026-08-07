import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedAppPaths = ["/app", "/onboarding"];
const adminPaths = ["/admin"];
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isAppRoute = protectedAppPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAdminRoute = adminPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthRoute = authPaths.includes(pathname);

  // Need to know if the user has a session. The anon JWT alone doesn't tell
  // us, so check for any Supabase session cookie. The cookie name is
  // `sb-<project-ref>-auth-token`, and the project ref is not known here.
  const hasSessionCookie = request.cookies
    .getAll()
    .some((cookie) => /^sb-.+-auth-token/.test(cookie.name));

  if (isAppRoute && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && !hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
