import "server-only";
import { isAiConfigured } from "@/lib/env";
import { buildFitnessContext } from "@/features/ai-coach/services/context";
import { generateStructured } from "@/features/ai-coach/services/generate";
import { workoutRecommendationPrompt } from "@/lib/ai/prompts";
import { workoutPlanSchema, type WorkoutPlan } from "@/features/ai-coach/schemas";
import { buildDeterministicWorkoutPlan } from "@/features/ai-coach/lib/responder";

export type WorkoutRecommendationResult = {
  plan: WorkoutPlan;
  source: "ai" | "deterministic";
};

export async function recommendWorkout(userId: string): Promise<WorkoutRecommendationResult> {
  const context = await buildFitnessContext();

  if (isAiConfigured()) {
    const result = await generateStructured(workoutPlanSchema, {
      feature: "workout",
      userId,
      prompt: workoutRecommendationPrompt(context),
      temperature: 0.7,
    });
    if (result.ok) {
      return { plan: result.data, source: "ai" };
    }
  }

  return { plan: buildDeterministicWorkoutPlan(context), source: "deterministic" };
}
