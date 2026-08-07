import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { getUser, isAdmin } from "@/lib/dal/auth";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to the BodyNova admin console.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await getUser();
  if (user) {
    redirect((await isAdmin()) ? "/admin/dashboard" : "/app/dashboard");
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-primary/5 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Shield className="h-7 w-7" aria-hidden />
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 grid gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1>
            <p className="text-sm text-muted-foreground">
              Restricted to administrators only.
            </p>
          </div>
          <AdminLoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Looking for the user app?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
