import "server-only";
import { isAiConfigured } from "@/lib/env";
import { createAiProvider } from "@/lib/ai/provider";
import { chatSystemPrompt } from "@/lib/ai/prompts";
import {
  checkAiRateLimit,
  AiRateLimitError,
} from "@/features/ai-coach/services/limits";
import { logAiUsage } from "@/features/ai-coach/services/usage";
import { buildFitnessContext } from "@/features/ai-coach/services/context";
import {
  getMessages,
  createConversation,
  addMessage,
  setConversationTitle,
} from "@/features/ai-coach/services/conversations";
import { executeTool } from "@/features/ai-coach/services/tools";
import { detectToolIntent } from "@/features/ai-coach/lib/tools";
import { answerDeterministically } from "@/features/ai-coach/lib/responder";
import type { AiMessageRole } from "@/types/database";

const HISTORY_LIMIT = 10;
const TITLE_LIMIT = 48;

function deriveTitle(message: string): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= TITLE_LIMIT) return cleaned;
  return `${cleaned.slice(0, TITLE_LIMIT - 1)}…`;
}

export type ChatStream = AsyncIterable<{ delta: string }>;

export type ChatSession = {
  conversationId: string;
  stream: ChatStream;
};

export class ChatSetupError extends Error {}

/**
 * Sets up and streams a chat turn for the authenticated user:
 *   1. rate limit check
 *   2. conversation resolution + persistence of the user message
 *   3. context build
 *   4. tool execution (safe, session-scoped) if intent matches
 *   5. deterministic fallback when no provider is configured or it fails
 *   6. provider streaming otherwise, with the assistant reply persisted.
 *
 * Setup errors throw (so the route handler can return a proper status code);
 * mid-stream provider failures degrade to deterministic analytics instead of
 * leaving the user with a blank response.
 */
export async function startChat(input: {
  userId: string;
  message: string;
  conversationId?: string;
  signal?: AbortSignal;
}): Promise<ChatSession> {
  const { userId, message, signal } = input;

  try {
    await checkAiRateLimit(userId);
  } catch (error) {
    if (error instanceof AiRateLimitError) {
      throw new ChatSetupError(error.message);
    }
    throw error;
  }

  // Resolve or create the conversation.
  let conversationId = input.conversationId;
  if (conversationId) {
    const existing = await getMessages(userId, conversationId);
    if (existing.length === 0) conversationId = undefined;
  }

  if (!conversationId) {
    const created = await createConversation(userId, deriveTitle(message));
    if (!created) {
      throw new ChatSetupError("Could not create a conversation.");
    }
    conversationId = created.id;
  } else {
    // Conversation exists — ensure it has a meaningful title on first message.
    await setConversationTitle(userId, conversationId, deriveTitle(message));
  }

  const userMessage = await addMessage({
    userId,
    conversationId,
    role: "user",
    content: message,
  });

  if (!userMessage) {
    throw new ChatSetupError("Could not save your message.");
  }

  const startedAt = Date.now();
  const context = await buildFitnessContext();

  // 1. Tool intent (natural-language actions) — executed safely server-side.
  const intent = detectToolIntent(message);
  if (intent) {
    let confirmation: string;
    let toolError: string | null = null;
    try {
      confirmation = await executeTool(userId, intent);
    } catch (error) {
      toolError = error instanceof Error ? error.message : "Tool action failed.";
      confirmation = toolError;
    }

    await logAiUsage({
      userId,
      feature: "chat",
      status: toolError ? "error" : "success",
      error: toolError,
      latencyMs: Date.now() - startedAt,
    });

    const stream = streamReplyAndPersist(userId, conversationId, confirmation, startedAt, {
      kind: "tool",
      tool: intent.action,
    });
    return { conversationId, stream };
  }

  // 2. Deterministic fallback when no provider is configured.
  if (!isAiConfigured()) {
    const reply = answerDeterministically(context, message);

    await logAiUsage({
      userId,
      feature: "chat",
      provider: null,
      model: null,
      status: "fallback",
      latencyMs: Date.now() - startedAt,
    });

    const text = formatDeterministicReply(reply.reply, reply.actions);
    const stream = streamReplyAndPersist(userId, conversationId, text, startedAt, {
      kind: "deterministic",
    });
    return { conversationId, stream };
  }

  // 3. Provider streaming.
  const history = await getMessages(userId, conversationId);
  const promptMessages = history
    .slice(-HISTORY_LIMIT)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as AiMessageRole, content: m.content }));

  const stream = streamProviderAndPersist({
    userId,
    conversationId,
    context,
    providerMessages: promptMessages,
    signal,
  });

  return { conversationId, stream };
}

function formatDeterministicReply(reply: string, actions: { id: string; label: string; href: string }[]): string {
  if (actions.length === 0) return reply;
  const actionLines = actions.map((a) => `→ ${a.label}: ${a.href}`).join("\n");
  return `${reply}\n\n**Quick actions**\n${actionLines}`;
}

async function* streamReplyAndPersist(
  userId: string,
  conversationId: string,
  reply: string,
  startedAt: number,
  metadata: Record<string, unknown>
): ChatStream {
  // Small chunks keep the typing animation alive.
  const words = reply.split(/(?<= )/);
  for (let i = 0; i < words.length; i += 3) {
    yield { delta: words.slice(i, i + 3).join("") };
    await new Promise((resolve) => setTimeout(resolve, 8));
  }

  await addMessage({
    userId,
    conversationId,
    role: "assistant",
    content: reply,
    metadata: { ...metadata, latencyMs: Date.now() - startedAt },
  });
}

async function* streamProviderAndPersist(params: {
  userId: string;
  conversationId: string;
  context: Awaited<ReturnType<typeof buildFitnessContext>>;
  providerMessages: { role: AiMessageRole; content: string }[];
  signal?: AbortSignal;
}): ChatStream {
  const { userId, conversationId, context, providerMessages, signal } = params;
  const provider = createAiProvider();
  const started = Date.now();

  let fullText = "";
  let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

  try {
    for await (const chunk of provider.stream({
      system: chatSystemPrompt(context),
      messages: providerMessages,
      temperature: 0.7,
      maxTokens: 1000,
      signal,
    })) {
      if (chunk.usage) usage = chunk.usage;
      if (chunk.delta) {
        fullText += chunk.delta;
        yield { delta: chunk.delta };
      }
    }
  } catch {
    // Provider failure mid-stream: if we haven't produced any text yet, fall
    // back to deterministic analytics so the user still gets an answer.
    if (fullText.length === 0) {
      const fallback = answerDeterministically(context, providerMessages.at(-1)?.content ?? "");
      const text = formatDeterministicReply(fallback.reply, fallback.actions);
      const words = text.split(/(?<= )/);
      for (let i = 0; i < words.length; i += 3) {
        fullText += words.slice(i, i + 3).join("");
        yield { delta: words.slice(i, i + 3).join("") };
        await new Promise((resolve) => setTimeout(resolve, 8));
      }
      await logAiUsage({
        userId,
        feature: "chat",
        provider: provider.name,
        model: provider.model,
        status: "fallback",
        error: "Provider stream failed; served deterministic analytics.",
        latencyMs: Date.now() - started,
      });
      await addMessage({
        userId,
        conversationId,
        role: "assistant",
        content: fullText,
        metadata: { kind: "deterministic", source: "fallback" },
      });
      return;
    }
  }

  if (fullText.length === 0) {
    const fallback = answerDeterministically(context, providerMessages.at(-1)?.content ?? "");
    fullText = formatDeterministicReply(fallback.reply, fallback.actions);
    for (const word of fullText.split(/(?<= )/)) {
      yield { delta: word };
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
    await logAiUsage({
      userId,
      feature: "chat",
      provider: provider.name,
      model: provider.model,
      status: "fallback",
      error: "Empty provider response; served deterministic analytics.",
      latencyMs: Date.now() - started,
    });
  } else {
    await logAiUsage({
      userId,
      feature: "chat",
      provider: provider.name,
      model: provider.model,
      status: "success",
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      latencyMs: Date.now() - started,
    });
  }

  await addMessage({
    userId,
    conversationId,
    role: "assistant",
    content: fullText,
    metadata: {
      kind: "ai",
      source: "provider",
      model: provider.model,
      tokens: usage.totalTokens,
    },
  });
}
