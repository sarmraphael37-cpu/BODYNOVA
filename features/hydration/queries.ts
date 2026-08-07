import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { WaterLog } from "@/types/database";

export type WaterTotalByDate = {
  date: string;
  total_ml: number;
};

export const getWaterLogs = cache(
  async (limit = 60): Promise<WaterLog[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    return data ?? [];
  }
);

export const getWaterTotalByDate = cache(
  async (days = 30): Promise<WaterTotalByDate[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const cutoffIso = cutoff.toISOString().slice(0, 10);

    const { data } = await supabase
      .from("water_logs")
      .select("date, amount_ml")
      .eq("user_id", user.id)
      .gte("date", cutoffIso)
      .order("date", { ascending: false });

    const totals = new Map<string, number>();
    for (const log of data ?? []) {
      totals.set(log.date, (totals.get(log.date) ?? 0) + log.amount_ml);
    }

    return Array.from(totals.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, total_ml]) => ({ date, total_ml }));
  }
);
