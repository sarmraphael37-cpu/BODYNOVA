"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import { getCoachContext, type CoachContext } from "@/features/ai-coach/queries";
import { formatNumber } from "@/utils/format";
import type { InsightType } from "@/types/database";

export type CoachActionState = {
  error?: string;
  success?: boolean;
};

type DraftInsight = {
  type: InsightType;
  title: string;
  content: string;
};

function buildInsights(ctx: CoachContext): DraftInsight[] {
  const insights: DraftInsight[] = [];

  if (ctx.weightChangeKg != null && ctx.recentWeight != null) {
    const direction =
      ctx.weightChangeKg > 0.3 ? "up" : ctx.weightChangeKg < -0.3 ? "down" : "stable";
    let content: string;
    if (direction === "stable") {
      content = `Your weight has stayed steady at ${formatNumber(
        ctx.recentWeight,
        1
      )} kg across your recent entries. Consistency like this makes trends easy to read.`;
    } else if (direction === "down") {
      content = `Your weight has decreased ${formatNumber(
        Math.abs(ctx.weightChangeKg),
        1
      )} kg to ${formatNumber(ctx.recentWeight, 1)} kg over your recent entries. Keep your deficit sustainable and lean out at a healthy pace.`;
    } else {
      content = `Your weight has increased ${formatNumber(
        ctx.weightChangeKg,
        1
      )} kg to ${formatNumber(
        ctx.recentWeight,
        1
      )} kg over your recent entries. Track it for another week before judging the trend.`;
    }
    insights.push({ type: "goal", title: "Weight trend", content });
  }

  if (ctx.workoutsLast30 > 0) {
    const perWeek = ctx.workoutsLast30 / 4.3;
    const content =
      perWeek >= 3
        ? `You've logged ${formatNumber(
            ctx.workoutsLast30,
            0
          )} workouts in the last 30 days (~${formatNumber(
            perWeek,
            1
          )} per week). Great consistency — protect your recovery and keep it up.`
        : `You've logged ${formatNumber(ctx.workoutsLast30, 0)} workouts in the last 30 days (~${formatNumber(
            perWeek,
            1
          )} per week). Aim for at least 3 sessions a week to build steady progress.`;
    insights.push({ type: "workout", title: "Workout consistency", content });
  }

  if (ctx.avgSteps7d > 0) {
    const content =
      ctx.avgSteps7d >= 8000
        ? `You're averaging ${formatNumber(
            ctx.avgSteps7d,
            0
          )} steps a day over the last 7 days. That's an excellent baseline for general health and recovery.`
        : `You're averaging ${formatNumber(
            ctx.avgSteps7d,
            0
          )} steps a day over the last 7 days. Adding a short walk can help recovery and daily calorie burn.`;
    insights.push({ type: "activity", title: "Daily movement", content });
  }

  if (ctx.waterTodayMl > 0) {
    const content =
      ctx.waterTodayMl >= 2000
        ? `You've logged ${formatNumber(
            ctx.waterTodayMl,
            0
          )} ml of water today. Great hydration — keep sipping steadily through the evening.`
        : `You've logged ${formatNumber(
            ctx.waterTodayMl,
            0
          )} ml of water today. Try to reach about 2,000 ml by the end of the day.`;
    insights.push({ type: "hydration", title: "Hydration check", content });
  }

  if (ctx.avgSleepMinutes7d != null) {
    const hours = ctx.avgSleepMinutes7d / 60;
    const content =
      ctx.avgSleepMinutes7d >= 420
        ? `You're averaging ${formatNumber(hours, 1)} hours of sleep a night over the last 7 days. Solid recovery supports performance and body composition.`
        : `You're averaging ${formatNumber(
            hours,
            1
          )} hours of sleep a night over the last 7 days. Prioritizing 7-9 hours will noticeably improve your training and recovery.`;
    insights.push({ type: "sleep", title: "Sleep recovery", content });
  }

  if (insights.length === 0) {
    insights.push({
      type: "daily",
      title: "Welcome to your AI Coach",
      content: `Start logging your weight, workouts, activity, water, and sleep. Your coach will use the last 30 days of data to surface personalized tips here.`,
    });
  }

  return insights;
}

export async function generateInsightsAction(): Promise<CoachActionState> {
  const user = await requireUser();
  const context = await getCoachContext();
  const insights = buildInsights(context);
  const supabase = await createClient();

  const { error } = await supabase.from("ai_insights").insert(
    insights.map((insight) => ({
      user_id: user.id,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      metadata: { generated_at: new Date().toISOString() },
    }))
  );

  if (error) return { error: "Failed to generate insights." };

  revalidatePath("/app/ai-coach");
  return { success: true };
}

export async function deleteInsightAction(insightId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("ai_insights")
    .delete()
    .eq("id", insightId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the insight.");

  revalidatePath("/app/ai-coach");
}
