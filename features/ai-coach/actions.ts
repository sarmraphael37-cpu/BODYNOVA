"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import { generateDailyInsight } from "@/features/ai-coach/services/insights";
import { generateWeeklyReview } from "@/features/ai-coach/services/weekly-review";
import { recommendWorkout } from "@/features/ai-coach/services/workouts";
import { analyzeProgress } from "@/features/ai-coach/services/progress";
import {
  getConversations,
  getMessages,
  createConversation,
  deleteConversation,
  clearConversation,
  type ConversationListItem,
} from "@/features/ai-coach/services/conversations";
import type { AiInsight, AiMessage } from "@/types/database";

// ---------------------------------------------------------------------------
// Generation actions (AI with deterministic fallback, persisted to ai_insights).
// ---------------------------------------------------------------------------

export async function generateDailyInsightAction(): Promise<{
  insight?: AiInsight;
  error?: string;
}> {
  try {
    const user = await requireUser();
    const insight = await generateDailyInsight(user.id);
    revalidatePath("/app/ai-coach");
    revalidatePath("/app/dashboard");
    return { insight };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate your insight." };
  }
}

export async function generateWeeklyReviewAction() {
  try {
    const user = await requireUser();
    const result = await generateWeeklyReview(user.id);
    revalidatePath("/app/ai-coach");
    revalidatePath("/app/reports");
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to generate your weekly review." };
  }
}

export async function recommendWorkoutAction() {
  try {
    const user = await requireUser();
    const result = await recommendWorkout(user.id);
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to recommend a workout." };
  }
}

export async function analyzeProgressAction() {
  try {
    const user = await requireUser();
    const result = await analyzeProgress(user.id);
    return { result };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to analyze your progress." };
  }
}

export async function deleteInsightAction(insightId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase
    .from("ai_insights")
    .delete()
    .eq("id", insightId)
    .eq("user_id", user.id);
  revalidatePath("/app/ai-coach");
}

// ---------------------------------------------------------------------------
// Conversation actions.
// ---------------------------------------------------------------------------

export async function getConversationsAction(): Promise<ConversationListItem[]> {
  const user = await requireUser();
  return getConversations(user.id);
}

export async function getMessagesAction(conversationId: string): Promise<AiMessage[]> {
  const user = await requireUser();
  return getMessages(user.id, conversationId);
}

export async function createConversationAction(): Promise<{ id: string; title: string } | { error: string }> {
  const user = await requireUser();
  const created = await createConversation(user.id, "New conversation");
  if (!created) return { error: "Could not create a conversation." };
  revalidatePath("/app/ai-coach");
  return { id: created.id, title: created.title };
}

export async function deleteConversationAction(conversationId: string): Promise<void> {
  const user = await requireUser();
  await deleteConversation(user.id, conversationId);
  revalidatePath("/app/ai-coach");
}

export async function clearConversationAction(conversationId: string): Promise<void> {
  const user = await requireUser();
  await clearConversation(user.id, conversationId);
  revalidatePath("/app/ai-coach");
}
