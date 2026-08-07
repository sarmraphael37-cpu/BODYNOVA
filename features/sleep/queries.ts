import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { SleepLog } from "@/types/database";

export const getSleepLogs = cache(
  async (limit = 60): Promise<SleepLog[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    return data ?? [];
  }
);

export const getSleepTrend = cache(
  async (days = 30): Promise<{ date: string; duration_minutes: number }[]> => {
    const logs = await getSleepLogs(days);
    return logs
      .slice()
      .reverse()
      .map((log) => ({
        date: log.date,
        duration_minutes: log.duration_minutes,
      }));
  }
);
