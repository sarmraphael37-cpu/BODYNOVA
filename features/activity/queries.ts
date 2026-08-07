import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { ActivityLog } from "@/types/database";

export type ActivityTrendPoint = {
  date: string;
  steps: number;
  active_minutes: number;
};

export const getActivityLogs = cache(
  async (limit = 60): Promise<ActivityLog[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    return data ?? [];
  }
);

export const getActivityTrend = cache(
  async (days = 30): Promise<ActivityTrendPoint[]> => {
    const logs = await getActivityLogs(days);
    return logs
      .slice()
      .reverse()
      .map((log) => ({
        date: log.date,
        steps: log.steps,
        active_minutes: log.active_minutes,
      }));
  }
);
