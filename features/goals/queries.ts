import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import { average, computeGoalProgress } from "@/services/calculations/fitness";
import type { FitnessGoal, GoalStatus, GoalType } from "@/types/database";

const statusOrder: Record<GoalStatus, number> = {
  active: 0,
  paused: 1,
  completed: 2,
  abandoned: 3,
};

export const getGoals = cache(async (): Promise<FitnessGoal[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("fitness_goals")
    .select("*")
    .eq("user_id", user.id);

  return (data ?? []).sort(
    (a, b) =>
      statusOrder[a.status] - statusOrder[b.status] ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

export const getActiveGoals = cache(async (): Promise<FitnessGoal[]> => {
  const goals = await getGoals();
  return goals.filter((goal) => goal.status === "active");
});

export type GoalWithProgress = FitnessGoal & {
  current_value: number | null;
  percent: number;
};

export const getGoalsWithProgress = cache(async (): Promise<GoalWithProgress[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString().slice(0, 10);

  const [goals, weightEntries, workouts, waterLogs, activityLogs, sleepLogs] =
    await Promise.all([
      getGoals(),
      supabase
        .from("weight_entries")
        .select("weight_kg")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1),
      supabase
        .from("workouts")
        .select("date, distance_km")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgoIso),
      supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().slice(0, 10)),
      supabase
        .from("activity_logs")
        .select("date, steps")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgoIso),
      supabase
        .from("sleep_logs")
        .select("duration_minutes")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgoIso),
    ]);

  const lastWeight = weightEntries.data?.[0]?.weight_kg ?? null;
  const workouts7d = workouts.data ?? [];
  const waterTodayMl =
    waterLogs.data?.reduce((sum, log) => sum + (log.amount_ml ?? 0), 0) ?? 0;
  const steps7d = (activityLogs.data ?? []).map((log) => log.steps ?? 0);
  const avgSteps7d = steps7d.length > 0 ? Math.round(average(steps7d)) : null;
  const sleepMinutes7d = (sleepLogs.data ?? []).map((log) => log.duration_minutes);
  const avgSleepMinutes7d =
    sleepMinutes7d.length > 0 ? Math.round(average(sleepMinutes7d)) : null;

  const currentValue = (type: GoalType): number | null => {
    switch (type) {
      case "weight":
        return lastWeight;
      case "steps":
        return avgSteps7d;
      case "workouts":
        return workouts7d.length;
      case "water":
        return waterTodayMl;
      case "sleep":
        return avgSleepMinutes7d;
      case "distance":
        return Math.round(
          workouts7d.reduce((sum, w) => sum + (w.distance_km ?? 0), 0) * 100
        ) / 100;
      default:
        return null;
    }
  };

  return goals.map((goal) => {
    const current = currentValue(goal.type);
    return {
      ...goal,
      current_value: current,
      percent:
        current != null
          ? computeGoalProgress(goal.start_value, current, goal.target_value).percent
          : 0,
    };
  });
});
