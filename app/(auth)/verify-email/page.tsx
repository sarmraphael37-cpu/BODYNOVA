import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Verify your email to complete your BodyNova account.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="grid gap-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
        <MailCheck className="h-7 w-7 text-success" aria-hidden />
      </div>
      <div className="grid gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a confirmation link to{" "}
          <span className="font-medium text-foreground">{email}</span>. Click the
          link in the email to activate your account, then sign in.
        </p>
      </div>
      <Link
        href="/login"
        className="text-sm font-medium text-primary hover:underline"
      >
        Go to sign in
      </Link>
    </div>
  );
}
