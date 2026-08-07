import "server-only";
import { getAiConfig } from "@/lib/env";

export type AiRole = "system" | "user" | "assistant";

export type AiChatMessage = {
  role: AiRole;
  content: string;
};

export type AiUsageInfo = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type AiCompletion = {
  content: string;
  usage: AiUsageInfo;
};

export type AiStreamChunk = {
  delta: string;
  usage?: AiUsageInfo;
};

export type AiCompleteParams = {
  system?: string;
  messages: AiChatMessage[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
};

export type AiStreamParams = AiCompleteParams & {
  signal?: AbortSignal;
};

export class AiProviderError extends Error {
  readonly status: number;
  readonly retryable: boolean;

  constructor(message: string, status = 500, retryable = false) {
    super(message);
    this.name = "AiProviderError";
    this.status = status;
    this.retryable = retryable;
  }
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  complete(params: AiCompleteParams): Promise<AiCompletion>;
  stream(params: AiStreamParams): AsyncIterable<AiStreamChunk>;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function normalizeMessages(system: string | undefined, messages: AiChatMessage[]) {
  if (!system) return messages;
  return [{ role: "system" as const, content: system }, ...messages];
}

/**
 * OpenAI-compatible Chat Completions provider built on plain fetch so no
 * vendor SDK is required and the endpoint can be pointed at any compatible
 * gateway (OpenRouter, local models, etc.) via environment variables.
 */
export class OpenAiCompatibleProvider implements AiProvider {
  readonly name: string;
  readonly model: string;

  constructor(
    private readonly config: { apiKey: string; baseUrl: string; model: string },
    name = "openai"
  ) {
    this.name = name;
    this.model = config.model;
  }

  private async request(
    body: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      DEFAULT_TIMEOUT_MS
    );
    if (signal) {
      if (signal.aborted) controller.abort();
      else signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = "";
        try {
          const data = await response.json();
          detail = data?.error?.message ?? "";
        } catch {
          // ignore parse failures
        }
        const message =
          detail ||
          `AI provider returned ${response.status} (${response.statusText}).`;
        throw new AiProviderError(
          message,
          response.status,
          response.status >= 500 || response.status === 429
        );
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  async complete(params: AiCompleteParams): Promise<AiCompletion> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: normalizeMessages(params.system, params.messages),
      temperature: params.temperature ?? 0.7,
      stream: false,
    };
    if (params.json) body.response_format = { type: "json_object" };
    if (params.maxTokens) body.max_tokens = params.maxTokens;

    const response = await this.request(body);
    const data = await response.json();

    const content: string = data?.choices?.[0]?.message?.content ?? "";
    if (!content) {
      throw new AiProviderError("AI provider returned an empty response.");
    }

    return {
      content,
      usage: {
        promptTokens: data?.usage?.prompt_tokens ?? 0,
        completionTokens: data?.usage?.completion_tokens ?? 0,
        totalTokens: data?.usage?.total_tokens ?? 0,
      },
    };
  }

  async *stream(params: AiStreamParams): AsyncIterable<AiStreamChunk> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: normalizeMessages(params.system, params.messages),
      temperature: params.temperature ?? 0.7,
      stream: true,
    };
    if (params.maxTokens) body.max_tokens = params.maxTokens;

    const response = await this.request(body, params.signal);
    if (!response.body) {
      throw new AiProviderError("AI provider returned no stream body.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") return;

          try {
            const json = JSON.parse(payload);
            const delta: string | undefined = json?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta.length > 0) {
              yield { delta };
            }
            if (json?.usage) {
              yield {
                delta: "",
                usage: {
                  promptTokens: json.usage.prompt_tokens ?? 0,
                  completionTokens: json.usage.completion_tokens ?? 0,
                  totalTokens: json.usage.total_tokens ?? 0,
                },
              };
            }
          } catch {
            // Ignore malformed SSE payloads; the stream may still recover.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

let cachedProvider: AiProvider | null = null;

export function createAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;
  const config = getAiConfig();
  cachedProvider = new OpenAiCompatibleProvider(config, config.provider);
  return cachedProvider;
}
