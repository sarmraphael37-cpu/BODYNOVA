import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedAppPaths = ["/app", "/onboarding"];
const adminPaths = ["/admin"];
// /reset-password is intentionally NOT here: the code-based reset flow is
// reachable without a session, so it must never be bounced to the dashboard.
const authPaths = ["/login", "/register", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { response, authenticated } = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isAppRoute = protectedAppPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAdminRoute = adminPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthRoute = authPaths.includes(pathname);
  const isAdminLogin = pathname === "/admin/login";

  // `authenticated` comes from `getUser()`, which validates the session. A
  // stale cookie alone no longer counts, so an invalid session can't bounce
  // between an auth page and a protected page in an infinite redirect loop.
  if (isAppRoute && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Admins use a dedicated sign-in page. /admin/login itself is always
  // reachable; it decides where to send the visitor based on their session.
  if (isAdminRoute && !isAdminLogin && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && authenticated) {
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
