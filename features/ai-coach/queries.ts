import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { AiInsight } from "@/types/database";

export type CoachContext = {
  recentWeight: number | null;
  weightChangeKg: number | null;
  workoutsLast7: number;
  workoutsLast30: number;
  avgSteps7d: number;
  avgSleepMinutes7d: number | null;
  waterTodayMl: number;
  activeMinutes7d: number;
};

export const getInsights = cache(async (): Promise<AiInsight[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("ai_insights")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
});

export const getCoachContext = cache(async (): Promise<CoachContext> => {
  const user = await requireUser();
  const supabase = await createClient();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString().slice(0, 10);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString().slice(0, 10);

  const [weightRes, workoutsRes, activityRes, sleepRes, waterRes] =
    await Promise.all([
      supabase
        .from("weight_entries")
        .select("date, weight_kg")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(60),
      supabase
        .from("workouts")
        .select("date")
        .eq("user_id", user.id)
        .gte("date", thirtyDaysAgoIso),
      supabase
        .from("activity_logs")
        .select("date, steps, active_minutes")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgoIso),
      supabase
        .from("sleep_logs")
        .select("date, duration_minutes")
        .eq("user_id", user.id)
        .gte("date", sevenDaysAgoIso),
      supabase
        .from("water_logs")
        .select("amount_ml")
        .eq("user_id", user.id)
        .eq("date", todayIso),
    ]);

  const weightEntries = weightRes.data ?? [];
  const workouts = workoutsRes.data ?? [];
  const activityLogs = activityRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];
  const waterLogs = waterRes.data ?? [];

  const recentWeight = weightEntries[0]?.weight_kg ?? null;
  const oldestWeight = weightEntries.at(-1)?.weight_kg ?? null;
  const weightChangeKg =
    recentWeight != null && oldestWeight != null
      ? recentWeight - oldestWeight
      : null;

  const workoutsLast7 = workouts.filter(
    (w) => w.date >= sevenDaysAgoIso
  ).length;

  const avgSteps7d =
    activityLogs.length > 0
      ? Math.round(
          activityLogs.reduce((sum, log) => sum + (log.steps ?? 0), 0) /
            activityLogs.length
        )
      : 0;

  const avgSleepMinutes7d =
    sleepLogs.length > 0
      ? Math.round(
          sleepLogs.reduce((sum, log) => sum + (log.duration_minutes ?? 0), 0) /
            sleepLogs.length
        )
      : null;

  const waterTodayMl =
    waterLogs.reduce((sum, log) => sum + (log.amount_ml ?? 0), 0) ?? 0;

  const activeMinutes7d =
    activityLogs.reduce((sum, log) => sum + (log.active_minutes ?? 0), 0) ?? 0;

  return {
    recentWeight,
    weightChangeKg,
    workoutsLast7,
    workoutsLast30: workouts.length,
    avgSteps7d,
    avgSleepMinutes7d,
    waterTodayMl,
    activeMinutes7d,
  };
});
