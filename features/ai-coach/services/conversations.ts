import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AiConversation, AiMessage, AiMessageRole } from "@/types/database";

export type ConversationListItem = AiConversation & {
  preview: string | null;
};

export const getConversations = async (
  userId: string
): Promise<ConversationListItem[]> => {
  const supabase = await createClient();

  const [conversationsRes, messagesRes] = await Promise.all([
    supabase
      .from("ai_conversations")
      .select("id, user_id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(50),
    supabase
      .from("ai_messages")
      .select("conversation_id, content, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const latestPerConversation = new Map<string, string>();
  for (const message of messagesRes.data ?? []) {
    if (!latestPerConversation.has(message.conversation_id)) {
      latestPerConversation.set(message.conversation_id, message.content);
    }
  }

  return (conversationsRes.data ?? []).map((conversation) => ({
    ...conversation,
    preview: latestPerConversation.get(conversation.id) ?? null,
  }));
};

export const getMessages = async (
  userId: string,
  conversationId: string
): Promise<AiMessage[]> => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("ai_messages")
    .select("id, conversation_id, user_id, role, content, metadata, created_at")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  return data ?? [];
};

export const createConversation = async (
  userId: string,
  title: string
): Promise<AiConversation | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ user_id: userId, title })
    .select("id, user_id, title, created_at, updated_at")
    .maybeSingle();

  if (error || !data) return null;
  return data;
};

export const deleteConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const supabase = await createClient();
  await supabase
    .from("ai_conversations")
    .delete()
    .eq("user_id", userId)
    .eq("id", conversationId);
};

export const clearConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const supabase = await createClient();
  await supabase
    .from("ai_messages")
    .delete()
    .eq("user_id", userId)
    .eq("conversation_id", conversationId);
};

export const touchConversation = async (
  userId: string,
  conversationId: string
): Promise<void> => {
  const supabase = await createClient();
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", conversationId);
};

export const setConversationTitle = async (
  userId: string,
  conversationId: string,
  title: string
): Promise<void> => {
  const supabase = await createClient();
  await supabase
    .from("ai_conversations")
    .update({ title })
    .eq("user_id", userId)
    .eq("id", conversationId);
};

export const addMessage = async ({
  userId,
  conversationId,
  role,
  content,
  metadata,
}: {
  userId: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  metadata?: Record<string, unknown> | null;
}): Promise<AiMessage | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_messages")
    .insert({ user_id: userId, conversation_id: conversationId, role, content, metadata })
    .select("id, conversation_id, user_id, role, content, metadata, created_at")
    .maybeSingle();

  if (error || !data) return null;
  await touchConversation(userId, conversationId);
  return data;
};
