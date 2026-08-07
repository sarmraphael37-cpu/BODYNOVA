import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { WeightEntry } from "@/types/database";

export type WeightEntryWithDelta = WeightEntry & { delta: number | null };

export const getWeightEntries = cache(
  async (limit = 90): Promise<WeightEntry[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    return data ?? [];
  }
);

export const getWeightEntriesWithDelta = cache(
  async (limit = 90): Promise<WeightEntryWithDelta[]> => {
    const entries = await getWeightEntries(limit);
    const sortedAsc = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return sortedAsc
      .map((entry, index) => ({
        ...entry,
        delta:
          index === 0 ? null : entry.weight_kg - (sortedAsc[index - 1]?.weight_kg ?? 0),
      }))
      .reverse();
  }
);

export const getLatestWeight = cache(async (): Promise<number | null> => {
  const entries = await getWeightEntries(1);
  return entries[0]?.weight_kg ?? null;
});

export const getWeightTrend = cache(
  async (days = 90): Promise<{ date: string; weight_kg: number }[]> => {
    const entries = await getWeightEntries(days);
    return entries
      .slice()
      .reverse()
      .map((entry) => ({ date: entry.date, weight_kg: entry.weight_kg }));
  }
);
