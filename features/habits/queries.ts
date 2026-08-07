import "server-only";
import { cache } from "react";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { Habit, HabitLog } from "@/types/database";

export type HabitWithLogs = Habit & {
  logs: HabitLog[];
  completedThisWeek: string[];
};

export const getHabitsWithLogs = cache(async (): Promise<HabitWithLogs[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const startIso = format(subDays(new Date(), 6), "yyyy-MM-dd");

  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (habitsError || !habits) return [];

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", startIso);

  if (logsError || !logs) return [];

  return habits.map((habit) => {
    const habitLogs = logs.filter((log) => log.habit_id === habit.id);
    return {
      ...habit,
      logs: habitLogs,
      completedThisWeek: habitLogs
        .filter((log) => log.completed)
        .map((log) => log.date),
    };
  });
});
