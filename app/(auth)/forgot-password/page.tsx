import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your BodyNova password.",
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; email?: string }>;
}) {
  const { sent, email } = await searchParams;

  if (sent) {
    return (
      <div className="grid gap-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
          <MailCheck className="h-7 w-7 text-success" aria-hidden />
        </div>
        <div className="grid gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, we&apos;ve
            sent a 6-digit reset code. Check your inbox and spam folder — the code
            expires in 15 minutes.
          </p>
        </div>
        <Link
          href={`/reset-password?email=${encodeURIComponent(email ?? "")}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Enter the code
        </Link>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-muted-foreground hover:underline"
        >
          Resend code
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a 6-digit reset code.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
