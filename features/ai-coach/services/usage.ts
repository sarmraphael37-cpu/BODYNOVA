import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AiUsageFeature, AiUsageStatus } from "@/types/database";

export type UsageLogInput = {
  userId: string;
  feature: AiUsageFeature;
  provider?: string | null;
  model?: string | null;
  status?: AiUsageStatus;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  latencyMs?: number | null;
  error?: string | null;
};

export async function logAiUsage(input: UsageLogInput): Promise<void> {
  const supabase = await createClient();
  await supabase.from("ai_usage").insert({
    user_id: input.userId,
    feature: input.feature,
    provider: input.provider ?? null,
    model: input.model ?? null,
    status: input.status ?? "success",
    prompt_tokens: input.promptTokens ?? 0,
    completion_tokens: input.completionTokens ?? 0,
    total_tokens: input.totalTokens ?? 0,
    latency_ms: input.latencyMs ?? null,
    error: input.error ?? null,
  });
}
