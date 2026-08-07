import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";

export type TodaySummary = {
  waterMl: number;
  waterTargetMl: number;
  steps: number;
  stepTarget: number;
  workoutsToday: number;
  lastWeight: number | null;
  caloriesBurned: number;
  activeMinutes: number;
};

export type WeightTrendPoint = {
  date: string;
  weight_kg: number;
};

export type WorkoutTrendPoint = {
  date: string;
  count: number;
  minutes: number;
};

export type DashboardData = {
  summary: TodaySummary;
  weightTrend: WeightTrendPoint[];
  workoutTrend: WorkoutTrendPoint[];
};

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const user = await requireUser();
  const supabase = await createClient();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString().slice(0, 10);

  const [waterRes, activityRes, workoutsRes, weightRes] = await Promise.all([
    supabase
      .from("water_logs")
      .select("amount_ml")
      .eq("user_id", user.id)
      .eq("date", todayIso),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayIso)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("id, duration_minutes, calories_burned, date")
      .eq("user_id", user.id)
      .gte("date", thirtyDaysAgoIso),
    supabase
      .from("weight_entries")
      .select("date, weight_kg")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(60),
  ]);

  const waterMl = waterRes.data?.reduce((sum, log) => sum + (log.amount_ml ?? 0), 0) ?? 0;
  const activity = activityRes.data;
  const workouts = workoutsRes.data ?? [];
  const weightEntries = weightRes.data ?? [];

  const todayWorkouts = workouts.filter((w) => w.date === todayIso);
  const workoutByDate = new Map<string, { count: number; minutes: number }>();
  for (const w of workouts) {
    const entry = workoutByDate.get(w.date) ?? { count: 0, minutes: 0 };
    entry.count += 1;
    entry.minutes += w.duration_minutes ?? 0;
    workoutByDate.set(w.date, entry);
  }
  const workoutTrend: WorkoutTrendPoint[] = Array.from(workoutByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, ...value }));

  return {
    summary: {
      waterMl,
      waterTargetMl: 2500,
      steps: activity?.steps ?? 0,
      stepTarget: 8000,
      workoutsToday: todayWorkouts.length,
      lastWeight: weightEntries[0]?.weight_kg ?? null,
      caloriesBurned:
        (activity?.calories_burned ?? 0) +
        todayWorkouts.reduce((sum, w) => sum + (w.calories_burned ?? 0), 0),
      activeMinutes: activity?.active_minutes ?? 0,
    },
    weightTrend: weightEntries
      .slice()
      .reverse()
      .map((entry) => ({ date: entry.date, weight_kg: entry.weight_kg })),
    workoutTrend,
  };
});
