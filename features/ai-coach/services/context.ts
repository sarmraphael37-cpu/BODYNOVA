import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile, requireUser } from "@/lib/dal/auth";
import { computeGoalProgressValues } from "@/features/ai-coach/lib/build-context";
import {
  computeWeightMetrics,
  computeWorkoutMetrics,
  computeActivityMetrics,
  computeSleepMetrics,
  computeWaterMetrics,
  computeHabitMetrics,
  computeNutritionMetrics,
  toIso,
} from "@/services/calculations/coach";
import { calculateAge } from "@/services/calculations/fitness";
import { computeConsistencyScore } from "@/services/calculations/fitness";
import type { FitnessContext } from "@/features/ai-coach/lib/types";

const TODAY = new Date();
const TODAY_ISO = toIso(TODAY);
const SEVEN_DAYS_AGO = toIso(new Date(TODAY.getTime() - 6 * 24 * 60 * 60 * 1000));
const THIRTY_DAYS_AGO = toIso(new Date(TODAY.getTime() - 29 * 24 * 60 * 60 * 1000));

/**
 * Fetches the authenticated user's recent fitness data and normalizes it into
 * a compact, privacy-minimized FitnessContext for the AI Coach. All user
 * identity is derived from the session — never from client input.
 */
export const buildFitnessContext = cache(async (): Promise<FitnessContext> => {
  const user = await requireUser();
  const supabase = await createClient();

  const [profileRes, weightRes, workoutsRes, activityRes, sleepRes, waterRes, nutritionRes, habitsRes, habitLogsRes, goalsRes] =
    await Promise.all([
      getProfile(),
      supabase
        .from("weight_entries")
        .select("date, weight_kg")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(60),
      supabase
        .from("workouts")
        .select("date, name, category, duration_minutes, calories_burned, distance_km")
        .eq("user_id", user.id)
        .gte("date", THIRTY_DAYS_AGO)
        .order("date", { ascending: false })
        .limit(50),
      supabase
        .from("activity_logs")
        .select("date, steps, active_minutes")
        .eq("user_id", user.id)
        .gte("date", THIRTY_DAYS_AGO),
      supabase
        .from("sleep_logs")
        .select("date, duration_minutes, quality")
        .eq("user_id", user.id)
        .gte("date", SEVEN_DAYS_AGO),
      supabase
        .from("water_logs")
        .select("date, amount_ml")
        .eq("user_id", user.id)
        .gte("date", SEVEN_DAYS_AGO),
      supabase
        .from("nutrition_entries")
        .select("date, calories, protein_g")
        .eq("user_id", user.id)
        .gte("date", SEVEN_DAYS_AGO),
      supabase.from("habits").select("id, name, target_per_week").eq("user_id", user.id),
      supabase
        .from("habit_logs")
        .select("habit_id, date, completed")
        .eq("user_id", user.id)
        .gte("date", SEVEN_DAYS_AGO),
      supabase
        .from("fitness_goals")
        .select("id, type, title, target_value, start_value, unit, status, target_date")
        .eq("user_id", user.id)
        .eq("status", "active"),
    ]);

  const profile = profileRes;
  const weightEntries = weightRes.data ?? [];
  const workouts = workoutsRes.data ?? [];
  const activityLogs = activityRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];
  const waterLogs = waterRes.data ?? [];
  const nutritionEntries = nutritionRes.data ?? [];
  const habits = habitsRes.data ?? [];
  const habitLogs = habitLogsRes.data ?? [];
  const goals = goalsRes.data ?? [];

  const weight = computeWeightMetrics(
    weightEntries.map((e) => ({ date: e.date, weightKg: Number(e.weight_kg) })),
    TODAY_ISO,
    profile?.height_cm ? Number(profile.height_cm) : null
  );

  const workoutMetrics = computeWorkoutMetrics(
    workouts.map((w) => ({
      date: w.date,
      category: w.category,
      durationMinutes: w.duration_minutes ?? 0,
    })),
    TODAY_ISO
  );

  const activity = computeActivityMetrics(
    activityLogs.map((a) => ({
      date: a.date,
      steps: a.steps ?? 0,
      activeMinutes: a.active_minutes ?? 0,
    })),
    TODAY_ISO
  );

  const sleep = computeSleepMetrics(
    sleepLogs.map((s) => ({
      date: s.date,
      durationMinutes: s.duration_minutes,
      quality: s.quality,
    })),
    TODAY_ISO
  );

  const waterTargetMl = profile?.preferences?.water_target_ml ?? 2500;
  const water = computeWaterMetrics(
    waterLogs.map((w) => ({ date: w.date, amountMl: w.amount_ml ?? 0 })),
    TODAY_ISO,
    waterTargetMl
  );

  const nutrition = computeNutritionMetrics(
    nutritionEntries.map((n) => ({
      date: n.date,
      calories: Number(n.calories ?? 0),
      proteinG: Number(n.protein_g ?? 0),
    })),
    TODAY_ISO
  );

  const habitMetrics = computeHabitMetrics(
    habits.map((h) => ({ id: h.id, name: h.name, targetPerWeek: h.target_per_week })),
    habitLogs.map((l) => ({
      habitId: l.habit_id,
      date: l.date,
      completed: l.completed ?? true,
    })),
    TODAY_ISO
  );

  const goalProgress = computeGoalProgressValues(goals, {
    currentWeightKg: weight.currentKg,
    avgSteps7d: activity.avgSteps7d,
    workouts7d: workoutMetrics.last7d,
    waterTodayMl: water.todayMl,
    avgSleepMinutes7d: sleep.avgMinutes7d,
    distance7dKm:
      workouts
        .filter((w) => w.date >= SEVEN_DAYS_AGO)
        .reduce((sum, w) => sum + (w.distance_km ?? 0), 0) || null,
  });

  const activeDays = [
    ...new Set([
      ...workouts.map((w) => w.date),
      ...activityLogs.filter((a) => (a.steps ?? 0) > 0 || (a.active_minutes ?? 0) > 0).map((a) => a.date),
      ...waterLogs.map((w) => w.date),
    ]),
  ];

  const consistency = computeConsistencyScore(activeDays, 1, 28);
  const hasData =
    weightEntries.length > 0 ||
    workouts.length > 0 ||
    activityLogs.length > 0 ||
    sleepLogs.length > 0 ||
    waterLogs.length > 0 ||
    nutritionEntries.length > 0 ||
    habits.length > 0;

  return {
    generatedAt: new Date().toISOString(),
    user: {
      firstName: profile?.full_name?.split(" ")[0] ?? "there",
      heightCm: profile?.height_cm ? Number(profile.height_cm) : null,
      age: calculateAge(profile?.date_of_birth ?? null),
      gender: profile?.gender ?? null,
      fitnessLevel: profile?.fitness_level ?? null,
      activityLevel: profile?.activity_level ?? null,
      primaryGoal: profile?.primary_goal ?? null,
      waterTargetMl,
      stepTarget: profile?.preferences?.step_target ?? 8000,
      calorieTarget: profile?.preferences?.calorie_target ?? null,
    },
    weight,
    workouts: {
      last7d: workoutMetrics.last7d,
      last30d: workoutMetrics.last30d,
      perWeek: workoutMetrics.perWeek,
      minutesLast30d: workoutMetrics.minutesLast30d,
      categories: workoutMetrics.categories,
      recent: workouts.slice(0, 6).map((w) => ({
        date: w.date,
        name: w.name,
        category: w.category,
        durationMinutes: w.duration_minutes ?? 0,
        caloriesBurned: w.calories_burned,
      })),
    },
    activity,
    sleep,
    water,
    nutrition,
    habits: habitMetrics,
    goals: goalProgress,
    consistency,
    hasData,
  };
});

export const getCurrentGoal = cache(async (): Promise<FitnessContext["goals"][number] | null> => {
  const context = await buildFitnessContext();
  if (context.goals.length === 0) return null;
  return context.goals[0];
});
