import "server-only";
import { createClient } from "@/lib/supabase/server";

export class AiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiRateLimitError";
  }
}

const PER_MINUTE = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 12);
const PER_DAY = Number(process.env.AI_RATE_LIMIT_PER_DAY ?? 200);

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

/**
 * Simple per-user rate limit backed by the ai_usage log. Errors are not
 * counted so a flaky provider doesn't burn the user's quota.
 */
export async function checkAiRateLimit(userId: string): Promise<void> {
  const supabase = await createClient();
  const minuteCutoff = minutesAgo(1);
  const dayCutoff = minutesAgo(60 * 24);

  const [{ count: lastMinute }, { count: lastDay }] = await Promise.all([
    supabase
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "error")
      .gte("created_at", minuteCutoff),
    supabase
      .from("ai_usage")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "error")
      .gte("created_at", dayCutoff),
  ]);

  if ((lastMinute ?? 0) >= PER_MINUTE) {
    throw new AiRateLimitError("You've sent a lot of messages in the last minute. Give me a moment, then try again.");
  }
  if ((lastDay ?? 0) >= PER_DAY) {
    throw new AiRateLimitError("You've reached your daily AI Coach limit. Check back tomorrow.");
  }
}
