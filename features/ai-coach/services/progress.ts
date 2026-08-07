import "server-only";
import { isAiConfigured } from "@/lib/env";
import { buildFitnessContext } from "@/features/ai-coach/services/context";
import { generateStructured } from "@/features/ai-coach/services/generate";
import { progressAnalysisPrompt } from "@/lib/ai/prompts";
import {
  progressAnalysisSchema,
  type ProgressAnalysis,
} from "@/features/ai-coach/schemas";
import { buildWeeklySummary } from "@/features/ai-coach/lib/responder";

export type ProgressAnalysisResult = {
  analysis: ProgressAnalysis;
  source: "ai" | "deterministic";
};

function deterministicAnalysis(context: Awaited<ReturnType<typeof buildFitnessContext>>): ProgressAnalysis {
  const summary = buildWeeklySummary(context);
  return {
    summary: summary.yourWeek,
    positiveChanges: summary.whatWentWell,
    negativeChanges: summary.needsAttention,
    patterns: summary.needsAttention.length > 0 ? summary.needsAttention.slice(0, 3) : [],
    tradeoffs: [],
    recommendedFocus: summary.recommendedFocus,
  };
}

export async function analyzeProgress(userId: string): Promise<ProgressAnalysisResult> {
  const context = await buildFitnessContext();

  if (isAiConfigured()) {
    const result = await generateStructured(progressAnalysisSchema, {
      feature: "progress",
      userId,
      prompt: progressAnalysisPrompt(context),
      temperature: 0.6,
    });
    if (result.ok) {
      return { analysis: result.data, source: "ai" };
    }
  }

  return { analysis: deterministicAnalysis(context), source: "deterministic" };
}
