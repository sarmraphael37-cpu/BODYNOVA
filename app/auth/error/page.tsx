import type { Metadata } from "next";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication error",
  description: "We couldn't complete the authentication flow.",
  robots: { index: false },
};

export default function AuthErrorPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="grid w-full max-w-md gap-6 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlert className="h-7 w-7 text-destructive" aria-hidden />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Link expired</h1>
          <p className="text-sm text-muted-foreground">
            The link you used is invalid or has expired. Please try again.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
