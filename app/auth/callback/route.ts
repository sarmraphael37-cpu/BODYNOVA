import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges the auth code Supabase appends to the redirect URL for a session.
// Used for email confirmation, password reset, and OAuth sign-in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/dashboard";

  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/app/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  // If code exchange fails, send the user to a friendly error page.
  const redirectTo = new URL("/auth/error", origin);
  return NextResponse.redirect(redirectTo);
}
