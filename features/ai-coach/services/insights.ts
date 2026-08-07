import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isAiConfigured } from "@/lib/env";
import { buildFitnessContext } from "@/features/ai-coach/services/context";
import { generateStructured } from "@/features/ai-coach/services/generate";
import { dailyInsightPrompt } from "@/lib/ai/prompts";
import { insightContentSchema } from "@/features/ai-coach/schemas";
import { buildTodayOverview } from "@/features/ai-coach/lib/responder";
import type { AiInsight, InsightType } from "@/types/database";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function findInsightForDate(
  userId: string,
  type: InsightType,
  date: string
): Promise<AiInsight | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .limit(5);

  return (
    data?.find(
      (insight) => (insight.metadata as { date?: string } | null)?.date === date
    ) ?? null
  );
}

/**
 * Generates (or returns the cached) daily insight for today. Deduplicated per
 * date so we never spam the feed with multiple "daily" insights in one day.
 */
export async function generateDailyInsight(
  userId: string
): Promise<AiInsight> {
  const existing = await findInsightForDate(userId, "daily", todayIso());
  if (existing) return existing;

  const context = await buildFitnessContext();
  const supabase = await createClient();

  if (isAiConfigured()) {
    const result = await generateStructured(insightContentSchema, {
      feature: "insight",
      userId,
      prompt: dailyInsightPrompt(context),
      temperature: 0.7,
    });

    if (result.ok) {
      const { data } = result;
      const { data: inserted, error } = await supabase
        .from("ai_insights")
        .insert({
          user_id: userId,
          type: data.type,
          title: data.title,
          summary: data.summary ?? null,
          content: data.content,
          metadata: {
            date: todayIso(),
            source: "ai",
            priority: data.priority,
            confidence: data.confidence,
            recommendations: data.recommendations,
            safetyNote: data.safetyNote ?? null,
          },
        })
        .select("*")
        .maybeSingle();

      if (!error && inserted) return inserted;
    }
  }

  const overview = buildTodayOverview(context);
  const { data: inserted, error } = await supabase
    .from("ai_insights")
    .insert({
      user_id: userId,
      type: "daily",
      title: `Today's focus: ${overview.focus}`,
      summary: overview.recommendedAction,
      content: overview.insight,
      metadata: { date: todayIso(), source: "deterministic" },
    })
    .select("*")
    .maybeSingle();

  if (error || !inserted) {
    throw new Error("Failed to persist today's insight.");
  }

  return inserted;
}

export const getInsights = async (userId: string): Promise<AiInsight[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
};
