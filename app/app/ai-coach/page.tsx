import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal/auth";
import { getInsights } from "@/features/ai-coach/queries";
import { CoachFeed } from "@/features/ai-coach/components/coach-feed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Coach",
  description: "Personalized coaching insights based on your latest data.",
};

export default async function AiCoachPage() {
  await requireProfile();
  const insights = await getInsights();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Coach</h1>
        <p className="text-sm text-muted-foreground">
          Personalized coaching insights built from your tracked data.
        </p>
      </div>

      <CoachFeed insights={insights} />
    </div>
  );
}
