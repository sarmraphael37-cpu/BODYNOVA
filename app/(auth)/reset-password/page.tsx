import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Set a new password for your BodyNova account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The reset link flows through /auth/callback which exchanges the code for
  // a session. Without a session, the user must request a new link.
  if (!user) {
    return (
      <div className="grid gap-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Link required</h1>
        <p className="text-sm text-muted-foreground">
          This page is only accessible through the password reset link emailed to
          you.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
