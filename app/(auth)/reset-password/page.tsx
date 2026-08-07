import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Set a new password for your BodyNova account.",
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <div className="grid gap-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Request a code first</h1>
        <p className="text-sm text-muted-foreground">
          This page needs the email you used when requesting a reset code.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Request a reset code
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the code we emailed you and choose a strong new password for{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <ResetPasswordForm email={email} />
      <p className="text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <Link href="/forgot-password" className="font-medium text-primary hover:underline">
          Request a new one
        </Link>
      </p>
    </div>
  );
}
