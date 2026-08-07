import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isAiConfigured } from "@/lib/env";
import { buildFitnessContext } from "@/features/ai-coach/services/context";
import { generateStructured } from "@/features/ai-coach/services/generate";
import { weeklyReviewPrompt } from "@/lib/ai/prompts";
import { weeklyReviewSchema, type WeeklyReview } from "@/features/ai-coach/schemas";
import { buildWeeklySummary } from "@/features/ai-coach/lib/responder";

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function renderWeeklyReview(review: WeeklyReview): string {
  return [
    `**Your week:** ${review.yourWeek}`,
    "",
    "**What went well**",
    ...review.whatWentWell.map((item) => `- ${item}`),
    "",
    "**What needs attention**",
    ...review.needsAttention.map((item) => `- ${item}`),
    "",
    `**Key insight:** ${review.keyInsight}`,
    `**Recommended focus:** ${review.recommendedFocus}`,
    `**Next week's target:** ${review.nextWeekTarget}`,
  ].join("\n");
}

export type WeeklyReviewResult = {
  review: WeeklyReview;
  source: "ai" | "deterministic";
};

/**
 * Generates a weekly review, persists it to ai_insights and progress_reports,
 * and returns it for display.
 */
export async function generateWeeklyReview(userId: string): Promise<WeeklyReviewResult> {
  const context = await buildFitnessContext();
  const supabase = await createClient();
  const periodStart = isoDaysAgo(6);
  const periodEnd = new Date().toISOString().slice(0, 10);

  let review: WeeklyReview;
  let source: "ai" | "deterministic" = "deterministic";

  if (isAiConfigured()) {
    const result = await generateStructured(weeklyReviewSchema, {
      feature: "weekly_review",
      userId,
      prompt: weeklyReviewPrompt(context),
      temperature: 0.6,
    });
    if (result.ok) {
      review = result.data;
      source = "ai";
    } else {
      const summary = buildWeeklySummary(context);
      review = {
        yourWeek: summary.yourWeek,
        whatWentWell: summary.whatWentWell,
        needsAttention: summary.needsAttention,
        keyInsight: summary.keyInsight,
        recommendedFocus: summary.recommendedFocus,
        nextWeekTarget: summary.nextWeekTarget,
      };
    }
  } else {
    const summary = buildWeeklySummary(context);
    review = {
      yourWeek: summary.yourWeek,
      whatWentWell: summary.whatWentWell,
      needsAttention: summary.needsAttention,
      keyInsight: summary.keyInsight,
      recommendedFocus: summary.recommendedFocus,
      nextWeekTarget: summary.nextWeekTarget,
    };
  }

  await supabase.from("ai_insights").insert({
    user_id: userId,
    type: "weekly",
    title: "Weekly review",
    summary: review.keyInsight,
    content: renderWeeklyReview(review),
    metadata: { source, periodStart, periodEnd },
  });

  await supabase.from("progress_reports").insert({
    user_id: userId,
    period: "weekly",
    period_start: periodStart,
    period_end: periodEnd,
    data: { review, source },
  });

  return { review, source };
}
