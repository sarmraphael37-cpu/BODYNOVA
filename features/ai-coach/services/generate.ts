import "server-only";
import { isAiConfigured } from "@/lib/env";
import { createAiProvider, AiProviderError } from "@/lib/ai/provider";
import type { AiProvider, AiUsageInfo } from "@/lib/ai/provider";
import { safeParseJson } from "@/features/ai-coach/schemas";
import type { z } from "zod";
import type { AiUsageFeature } from "@/types/database";
import { logAiUsage } from "@/features/ai-coach/services/usage";

export type StructuredResult<T> =
  | { ok: true; data: T; usage: AiUsageInfo; provider: string; model: string }
  | { ok: false; error?: string };

type GenerateOptions = {
  feature: AiUsageFeature;
  userId: string;
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
};

function providerInfo(provider: AiProvider) {
  return { provider: provider.name, model: provider.model };
}

export async function logFailedGeneration(
  options: GenerateOptions,
  error: string,
  startedAt: number
): Promise<void> {
  await logAiUsage({
    userId: options.userId,
    feature: options.feature,
    status: "fallback",
    error,
    latencyMs: Date.now() - startedAt,
  });
}

/**
 * Generates structured output, validated by `schema`. If the provider is not
 * configured, the first attempt fails, or the output is invalid, it retries
 * once and then returns `{ ok: false }` so the caller can fall back to
 * deterministic analytics. Never throws for provider/validation failures.
 */
export async function generateStructured<T>(
  schema: z.ZodType<T>,
  options: GenerateOptions
): Promise<StructuredResult<T>> {
  if (!isAiConfigured()) return { ok: false };

  const startedAt = Date.now();
  let lastError = "AI is not configured.";

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const provider = createAiProvider();
      const completion = await provider.complete({
        system: options.system,
        messages: [{ role: "user", content: options.prompt }],
        json: true,
        temperature: options.temperature,
        maxTokens: options.maxTokens ?? 1200,
      });

      const data = safeParseJson(schema, completion.content);
      if (!data) {
        lastError = "AI returned invalid JSON.";
        await logFailedGeneration(options, lastError, startedAt);
        continue;
      }

      await logAiUsage({
        userId: options.userId,
        feature: options.feature,
        ...providerInfo(provider),
        status: "success",
        promptTokens: completion.usage.promptTokens,
        completionTokens: completion.usage.completionTokens,
        totalTokens: completion.usage.totalTokens,
        latencyMs: Date.now() - startedAt,
      });

      return { ok: true, data, usage: completion.usage, ...providerInfo(provider) };
    } catch (error) {
      lastError =
        error instanceof AiProviderError
          ? error.message
          : error instanceof Error
            ? error.message
            : "AI request failed.";
      await logFailedGeneration(options, lastError, startedAt);
    }
  }

  return { ok: false, error: lastError };
}

export async function generateChatText(
  options: GenerateOptions
): Promise<{ content: string; usage: AiUsageInfo } | null> {
  if (!isAiConfigured()) return null;

  const startedAt = Date.now();
  try {
    const provider = createAiProvider();
    const completion = await provider.complete({
      system: options.system,
      messages: [{ role: "user", content: options.prompt }],
      temperature: options.temperature,
      maxTokens: options.maxTokens ?? 1200,
    });

    await logAiUsage({
      userId: options.userId,
      feature: options.feature,
      ...providerInfo(provider),
      status: "success",
      promptTokens: completion.usage.promptTokens,
      completionTokens: completion.usage.completionTokens,
      totalTokens: completion.usage.totalTokens,
      latencyMs: Date.now() - startedAt,
    });

    return { content: completion.content, usage: completion.usage };
  } catch (error) {
    const message =
      error instanceof AiProviderError
        ? error.message
        : error instanceof Error
          ? error.message
          : "AI request failed.";
    await logFailedGeneration(options, message, startedAt);
    return null;
  }
}
