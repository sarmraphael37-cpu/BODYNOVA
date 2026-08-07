import { redirect } from "next/navigation";
import { getUser } from "@/lib/dal/auth";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";
import { Logo } from "@/components/layout/logo";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo className="h-12 w-12" />
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Let&apos;s set you up
            </h1>
            <p className="text-sm text-muted-foreground">
              A few quick questions so we can tailor BodyNova to you.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <OnboardingForm />
        </div>
      </div>
    </div>
  );
}
