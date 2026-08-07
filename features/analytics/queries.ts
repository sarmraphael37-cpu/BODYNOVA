import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import { average, computeConsistencyScore } from "@/services/calculations/fitness";
import type { ProgressReport } from "@/types/database";

export type WeightTrendPoint = {
  date: string;
  weight_kg: number;
};

export type WorkoutTrendPoint = {
  date: string;
  minutes: number;
  calories: number;
};

export type SleepTrendPoint = {
  date: string;
  duration_minutes: number;
};

export type ActivityTrendPoint = {
  date: string;
  steps: number;
};

export type WaterTrendPoint = {
  date: string;
  total_ml: number;
};

export type AnalyticsData = {
  weightTrend: WeightTrendPoint[];
  workoutTrend: WorkoutTrendPoint[];
  sleepTrend: SleepTrendPoint[];
  activityTrend: ActivityTrendPoint[];
  waterTrend: WaterTrendPoint[];
  consistency: number;
  avgSleep: number;
  avgSteps: number;
  totals: {
    workouts: number;
    workoutMinutes: number;
    workoutCalories: number;
    waterMl: number;
    activeMinutes: number;
  };
};

export const getAnalyticsData = cache(async (): Promise<AnalyticsData> => {
  const user = await requireUser();
  const supabase = await createClient();

  const today = new Date();

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
  const ninetyDaysAgoIso = ninetyDaysAgo.toISOString().slice(0, 10);

  const [weightRes, workoutsRes, sleepRes, activityRes, waterRes] = await Promise.all([
    supabase
      .from("weight_entries")
      .select("date, weight_kg")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoIso)
      .order("date", { ascending: true }),
    supabase
      .from("workouts")
      .select("date, duration_minutes, calories_burned")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoIso),
    supabase
      .from("sleep_logs")
      .select("date, duration_minutes")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoIso)
      .order("date", { ascending: true }),
    supabase
      .from("activity_logs")
      .select("date, steps, active_minutes")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoIso)
      .order("date", { ascending: true }),
    supabase
      .from("water_logs")
      .select("date, amount_ml")
      .eq("user_id", user.id)
      .gte("date", ninetyDaysAgoIso),
  ]);

  const weightEntries = weightRes.data ?? [];
  const workouts = workoutsRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];
  const activityLogs = activityRes.data ?? [];
  const waterLogs = waterRes.data ?? [];

  const workoutByDate = new Map<string, { minutes: number; calories: number }>();
  for (const workout of workouts) {
    const entry = workoutByDate.get(workout.date) ?? { minutes: 0, calories: 0 };
    entry.minutes += workout.duration_minutes ?? 0;
    entry.calories += workout.calories_burned ?? 0;
    workoutByDate.set(workout.date, entry);
  }
  const workoutTrend: WorkoutTrendPoint[] = Array.from(workoutByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, ...value }));

  const waterByDate = new Map<string, number>();
  for (const log of waterLogs) {
    waterByDate.set(log.date, (waterByDate.get(log.date) ?? 0) + (log.amount_ml ?? 0));
  }
  const waterTrend: WaterTrendPoint[] = Array.from(waterByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total_ml]) => ({ date, total_ml }));

  const sleepTrend: SleepTrendPoint[] = sleepLogs.map((log) => ({
    date: log.date,
    duration_minutes: log.duration_minutes,
  }));

  const activityTrend: ActivityTrendPoint[] = activityLogs.map((log) => ({
    date: log.date,
    steps: log.steps,
  }));

  const activeDays = [
    ...workoutByDate.keys(),
    ...activityLogs.map((log) => log.date),
    ...waterByDate.keys(),
  ];

  const recentSleep = sleepTrend.slice(-30);
  const recentActivity = activityTrend.slice(-30);

  return {
    weightTrend: weightEntries.map((entry) => ({
      date: entry.date,
      weight_kg: entry.weight_kg,
    })),
    workoutTrend,
    sleepTrend,
    activityTrend,
    waterTrend,
    consistency: computeConsistencyScore(activeDays, 3, 28),
    avgSleep: Math.round(average(recentSleep.map((point) => point.duration_minutes))),
    avgSteps: Math.round(average(recentActivity.map((point) => point.steps))),
    totals: {
      workouts: workouts.length,
      workoutMinutes: workoutTrend.reduce((sum, point) => sum + point.minutes, 0),
      workoutCalories: workoutTrend.reduce((sum, point) => sum + point.calories, 0),
      waterMl: waterTrend.reduce((sum, point) => sum + point.total_ml, 0),
      activeMinutes: activityLogs.reduce((sum, log) => sum + (log.active_minutes ?? 0), 0),
    },
  };
});

export const getReports = cache(async (): Promise<ProgressReport[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("progress_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("period_start", { ascending: false })
    .limit(12);

  return data ?? [];
});
