import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/dal/auth";
import { buildFitnessContext } from "@/features/ai-coach/services/context";
import {
  buildTodayOverview,
  buildWeeklySummary,
  type TodayOverview,
  type WeeklySummary,
} from "@/features/ai-coach/lib/responder";
import {
  getConversations,
  getMessages,
  type ConversationListItem,
} from "@/features/ai-coach/services/conversations";
import type { AiMessage } from "@/types/database";
import type { GoalProgressValue } from "@/features/ai-coach/lib/types";

export type AiCoachPageData = {
  overview: TodayOverview;
  weekly: WeeklySummary;
  currentGoal: GoalProgressValue | null;
  conversations: ConversationListItem[];
  activeConversationId?: string;
  activeMessages: AiMessage[];
};

export const getAiCoachPageData = cache(async (): Promise<AiCoachPageData> => {
  const user = await requireUser();
  const context = await buildFitnessContext();
  const conversations = await getConversations(user.id);
  const activeConversation = conversations[0];
  const activeMessages = activeConversation
    ? await getMessages(user.id, activeConversation.id)
    : [];

  return {
    overview: buildTodayOverview(context),
    weekly: buildWeeklySummary(context),
    currentGoal: context.goals[0] ?? null,
    conversations,
    activeConversationId: activeConversation?.id,
    activeMessages,
  };
});
