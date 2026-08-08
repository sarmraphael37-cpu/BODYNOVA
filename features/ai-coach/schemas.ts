import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas for validating AI provider output before it reaches the UI.
// If a structured response fails validation we retry once, then fall back to
// deterministic analytics — the dashboard never crashes on bad AI output.
// ---------------------------------------------------------------------------

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export const prioritySchema = z.enum(["high", "medium", "low"]);

export const insightTypeSchema = z.enum([
  "daily",
  "weekly",
  "goal",
  "workout",
  "nutrition",
  "hydration",
  "activity",
  "sleep",
]);

export const insightContentSchema = z.object({
  type: insightTypeSchema,
  title: z.string().trim().min(1).max(80),
  summary: z.string().trim().max(240).optional(),
  content: z.string().trim().min(1).max(2000),
  priority: prioritySchema,
  recommendations: z.array(z.string().trim().min(1)).max(5).default([]),
  confidence: confidenceSchema,
  safetyNote: z.string().trim().max(240).optional(),
});
export type InsightContent = z.infer<typeof insightContentSchema>;

export const weeklyReviewSchema = z.object({
  yourWeek: z.string().trim().min(1).max(600),
  whatWentWell: z.array(z.string().trim().min(1)).max(10),
  needsAttention: z.array(z.string().trim().min(1)).max(10),
  keyInsight: z.string().trim().min(1).max(400),
  recommendedFocus: z.string().trim().min(1).max(120),
  nextWeekTarget: z.string().trim().min(1).max(200),
});
export type WeeklyReview = z.infer<typeof weeklyReviewSchema>;

export const exerciseSchema = z.object({
  name: z.string().trim().min(1).max(80),
  sets: z.number().int().positive().max(10).optional(),
  reps: z.string().trim().max(40).optional(),
  durationSeconds: z.number().int().positive().max(7200).optional(),
  notes: z.string().trim().max(200).optional(),
});

export const workoutPlanSchema = z.object({
  title: z.string().trim().min(1).max(80),
  durationMinutes: z.number().int().positive().max(240),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  focus: z.string().trim().max(80).optional(),
  warmup: z.string().trim().max(200).optional(),
  exercises: z.array(exerciseSchema).min(1).max(12),
  cooldown: z.string().trim().max(200).optional(),
  safetyNote: z.string().trim().max(240).optional(),
});
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;

export const progressAnalysisSchema = z.object({
  summary: z.string().trim().min(1).max(600),
  positiveChanges: z.array(z.string().trim().min(1)).max(8),
  negativeChanges: z.array(z.string().trim().min(1)).max(8),
  patterns: z.array(z.string().trim().min(1)).max(8),
  tradeoffs: z.array(z.string().trim().min(1)).max(6),
  recommendedFocus: z.string().trim().min(1).max(200),
});
export type ProgressAnalysis = z.infer<typeof progressAnalysisSchema>;

export const chatResponseSchema = z.object({
  reply: z.string().trim().min(1).max(3000),
  actions: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40),
        label: z.string().trim().min(1).max(40),
        href: z.string().trim().startsWith("/").max(120),
      })
    )
    .max(4)
    .default([]),
});
export type ChatResponseContent = z.infer<typeof chatResponseSchema>;

export const chatAttachmentSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(255),
  mime: z.string().trim().min(1).max(120),
  kind: z.enum(["image", "text"]),
  size: z.number().int().min(1).max(4 * 1024 * 1024),
  path: z.string().trim().min(1).max(400),
});
export type ChatAttachment = z.infer<typeof chatAttachmentSchema>;

export const chatInputSchema = z
  .object({
    message: z.string().trim().max(2000),
    conversationId: z.string().uuid().optional(),
    attachments: z.array(chatAttachmentSchema).max(4).default([]),
  })
  .refine((value) => value.message.length > 0 || value.attachments.length > 0, {
    message: "Send a message or attach a file.",
  });
export type ChatInput = z.infer<typeof chatInputSchema>;

// ---------------------------------------------------------------------------
// Helpers for parsing JSON from provider output (may be wrapped in fences).
// ---------------------------------------------------------------------------

export function extractJson(text: string): string {
  const cleaned = text.trim();
  const fence = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) return fence[1].trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export function parseJsonObject<T>(text: string): T {
  const json = extractJson(text);
  return JSON.parse(json) as T;
}

export function safeParseJson<T>(schema: z.ZodType<T>, text: string): T | null {
  try {
    const parsed = parseJsonObject<unknown>(text);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
