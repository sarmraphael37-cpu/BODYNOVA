import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { Notification } from "@/types/database";

export const getNotificationsSummary = cache(
  async (): Promise<{
    unreadCount: number;
    recent: Notification[];
  }> => {
    const user = await requireUser();
    const supabase = await createClient();

    const [unreadResult, recentResult] = await Promise.all([
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false),
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    return {
      unreadCount: unreadResult.count ?? 0,
      recent: recentResult.data ?? [],
    };
  }
);

export const getNotifications = cache(
  async (limit = 100): Promise<Notification[]> => {
    const user = await requireUser();
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }
);
