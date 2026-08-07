import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal/auth";
import { getAiCoachPageData } from "@/features/ai-coach/queries";
import { OverviewCards } from "@/features/ai-coach/components/overview-cards";
import { AiCoachClient } from "@/features/ai-coach/components/ai-coach-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Coach",
  description:
    "Personalized coaching, weekly intelligence, and a private AI chat powered by your fitness journey.",
};

export default async function AiCoachPage() {
  await requireProfile();
  const data = await getAiCoachPageData();

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your AI Fitness Coach</h1>
          <p className="text-sm text-muted-foreground">
            Personalized guidance powered by your recorded fitness journey.
          </p>
        </div>
      </div>

      <OverviewCards
        overview={data.overview}
        weekly={data.weekly}
        currentGoal={data.currentGoal}
      />

      <AiCoachClient
        initialConversations={data.conversations}
        initialMessages={data.activeMessages}
        initialConversationId={data.activeConversationId}
      />
    </div>
  );
}
