import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/dal/auth";
import { bmi, bmiCategory, computeConsistencyScore, computeGoalProgress } from "@/services/calculations/fitness";
import { buildDashboardInsights } from "@/features/dashboard/insights";
import { average } from "@/services/calculations/fitness";
import type { GoalType, PrimaryGoal, UnitSystem } from "@/types/database";

export type TodaySummary = {
  waterMl: number;
  waterTargetMl: number;
  steps: number;
  stepTarget: number;
  activeMinutes: number;
  caloriesBurned: number;
  workoutsToday: number;
  workoutsThisWeek: number;
  workoutMinutesThisWeek: number;
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

export type ActivityTrendPoint = {
  date: string;
  steps: number;
};

export type SleepTrendPoint = {
  date: string;
  duration_minutes: number;
  quality: string | null;
};

export type WaterTrendPoint = {
  date: string;
  total_ml: number;
};

export type NutritionSummary = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  entries: number;
};

export type ActiveGoal = {
  id: string;
  type: GoalType;
  title: string;
  target_value: number;
  start_value: number;
  unit: string;
  target_date: string | null;
  current_value: number | null;
  percent: number;
};

export type RecentActivityItem = {
  id: string;
  type: "workout" | "weight" | "sleep" | "activity" | "water" | "meal";
  title: string;
  subtitle: string;
  date: string;
};

export type CoachInsight = {
  id: string;
  title: string;
  content: string;
  tone: "positive" | "neutral" | "warning" | "action";
};

export type DashboardData = {
  firstName: string;
  primaryGoal: PrimaryGoal | null;
  unitSystem: UnitSystem;
  summary: TodaySummary;
  weightTrend: WeightTrendPoint[];
  workoutTrend: WorkoutTrendPoint[];
  activityTrend: ActivityTrendPoint[];
  sleepTrend: SleepTrendPoint[];
  waterTrend: WaterTrendPoint[];
  nutrition: NutritionSummary;
  calorieTarget: number | null;
  goals: ActiveGoal[];
  recentActivity: RecentActivityItem[];
  consistency: number;
  insights: CoachInsight[];
  achievements: {
    unlocked: number;
    total: number;
    recent: { name: string; icon: string; unlocked_at: string }[];
    lockedPreview: { name: string; icon: string }[];
  };
  bmi: { value: number; category: string } | null;
  lastWeight: number | null;
  lastBodyFat: number | null;
  weightChangeKg: number | null;
};

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const profile = await getProfile();
  const supabase = await createClient();

  const today = new Date();
  const todayIso = toIso(today);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoIso = toIso(sevenDaysAgo);

  const twentyEightDaysAgo = new Date(today);
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);
  const twentyEightDaysAgoIso = toIso(twentyEightDaysAgo);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysAgoIso = toIso(thirtyDaysAgo);

  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
  const ninetyDaysAgoIso = toIso(ninetyDaysAgo);

  const userId = profile?.id ?? "";
  const weekStartIso = toIso(weekStart);

  const [
    waterRes,
    activityRes,
    workoutsRes,
    weightRes,
    sleepRes,
    nutritionRes,
    goalsRes,
    achievementsRes,
    unlockedRes,
  ] = await Promise.all([
    supabase
      .from("water_logs")
      .select("date, amount_ml")
      .eq("user_id", userId)
      .gte("date", twentyEightDaysAgoIso),
    supabase
      .from("activity_logs")
      .select("date, steps, active_minutes, calories_burned")
      .eq("user_id", userId)
      .gte("date", twentyEightDaysAgoIso),
    supabase
      .from("workouts")
      .select("id, date, name, category, duration_minutes, calories_burned, distance_km")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgoIso),
    supabase
      .from("weight_entries")
      .select("id, date, weight_kg, body_fat_percentage")
      .eq("user_id", userId)
      .gte("date", ninetyDaysAgoIso)
      .order("date", { ascending: false })
      .limit(90),
    supabase
      .from("sleep_logs")
      .select("date, duration_minutes, quality")
      .eq("user_id", userId)
      .gte("date", sevenDaysAgoIso),
    supabase
      .from("nutrition_entries")
      .select("meal_type, food_name, calories, protein_g, carbs_g, fat_g, fiber_g")
      .eq("user_id", userId)
      .eq("date", todayIso),
    supabase
      .from("fitness_goals")
      .select("id, type, title, target_value, start_value, unit, target_date, status")
      .eq("user_id", userId)
      .eq("status", "active"),
    supabase.from("achievements").select("id, code, name, icon").order("category").order("name"),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false })
      .limit(12),
  ]);

  const waterLogs = waterRes.data ?? [];
  const activityLogs = activityRes.data ?? [];
  const workouts = workoutsRes.data ?? [];
  const weightEntries = weightRes.data ?? [];
  const sleepLogs = sleepRes.data ?? [];
  const nutritionEntries = nutritionRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const achievements = achievementsRes.data ?? [];
  const unlocked = unlockedRes.data ?? [];

  const waterTodayMl = waterLogs
    .filter((log) => log.date === todayIso)
    .reduce((sum, log) => sum + (log.amount_ml ?? 0), 0);

  const activityToday = activityLogs.find((log) => log.date === todayIso);
  const workoutsToday = workouts.filter((w) => w.date === todayIso);
  const workoutsThisWeek = workouts.filter((w) => w.date >= weekStartIso && w.date <= todayIso);

  const caloriesToday =
    (activityToday?.calories_burned ?? 0) +
    workoutsToday.reduce((sum, w) => sum + (w.calories_burned ?? 0), 0);

  const waterTargetMl = profile?.preferences?.water_target_ml ?? 2500;
  const stepTarget = profile?.preferences?.step_target ?? 8000;

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

  const activity7d = activityLogs.filter((log) => log.date >= sevenDaysAgoIso);
  const activityTrend: ActivityTrendPoint[] = activity7d
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: log.date, steps: log.steps }));

  const sleepTrend: SleepTrendPoint[] = sleepLogs
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({
      date: log.date,
      duration_minutes: log.duration_minutes,
      quality: log.quality,
    }));

  const waterByDate = new Map<string, number>();
  for (const log of waterLogs) {
    if (log.date < sevenDaysAgoIso) continue;
    waterByDate.set(log.date, (waterByDate.get(log.date) ?? 0) + (log.amount_ml ?? 0));
  }
  const waterTrend: WaterTrendPoint[] = Array.from(waterByDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total_ml]) => ({ date, total_ml }));

  const nutrition: NutritionSummary = {
    calories: nutritionEntries.reduce((sum, e) => sum + (e.calories ?? 0), 0),
    protein_g: nutritionEntries.reduce((sum, e) => sum + (e.protein_g ?? 0), 0),
    carbs_g: nutritionEntries.reduce((sum, e) => sum + (e.carbs_g ?? 0), 0),
    fat_g: nutritionEntries.reduce((sum, e) => sum + (e.fat_g ?? 0), 0),
    fiber_g: nutritionEntries.reduce((sum, e) => sum + (e.fiber_g ?? 0), 0),
    entries: nutritionEntries.length,
  };

  const lastWeight = weightEntries[0]?.weight_kg ?? null;
  const previousWeight = weightEntries[1]?.weight_kg ?? null;
  const weightChangeKg =
    lastWeight != null && previousWeight != null ? lastWeight - previousWeight : null;

  const activeDays = [
    ...workoutByDate.keys(),
    ...activityLogs.filter((log) => (log.steps ?? 0) > 0 || (log.active_minutes ?? 0) > 0).map((log) => log.date),
    ...waterLogs.map((log) => log.date),
  ];

  const avgSteps7d = average(activity7d.map((log) => log.steps ?? 0));
  const avgSleepMinutes7d =
    sleepLogs.length > 0 ? Math.round(average(sleepLogs.map((log) => log.duration_minutes))) : null;

  const goalCurrentValue = (type: GoalType): number | null => {
    switch (type) {
      case "weight":
        return lastWeight;
      case "steps":
        return Math.round(avgSteps7d);
      case "workouts":
        return workouts.filter((w) => w.date >= sevenDaysAgoIso).length;
      case "water":
        return waterTodayMl;
      case "sleep":
        return avgSleepMinutes7d;
      case "distance":
        return Math.round(
          workouts.filter((w) => w.date >= sevenDaysAgoIso).reduce((sum, w) => sum + (w.distance_km ?? 0), 0) * 100
        ) / 100;
      default:
        return null;
    }
  };

  const goalsWithProgress: ActiveGoal[] = goals.map((goal) => {
    const currentValue = goalCurrentValue(goal.type);
    const percent =
      currentValue != null
        ? computeGoalProgress(goal.start_value, currentValue, goal.target_value).percent
        : 0;
    return {
      id: goal.id,
      type: goal.type,
      title: goal.title,
      target_value: goal.target_value,
      start_value: goal.start_value,
      unit: goal.unit,
      target_date: goal.target_date,
      current_value: currentValue,
      percent,
    };
  });

  const recentActivity: RecentActivityItem[] = [];
  for (const w of workouts.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)) {
    recentActivity.push({
      id: `workout-${w.id}`,
      type: "workout",
      title: "Workout logged",
      subtitle: `${w.name} · ${w.duration_minutes ?? 0}m`,
      date: w.date,
    });
  }
  for (const entry of weightEntries.slice(0, 2)) {
    recentActivity.push({
      id: `weight-${entry.id}`,
      type: "weight",
      title: "Weight logged",
      subtitle: `${entry.weight_kg} kg`,
      date: entry.date,
    });
  }
  for (const log of sleepLogs.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)) {
    recentActivity.push({
      id: `sleep-${log.date}`,
      type: "sleep",
      title: "Sleep logged",
      subtitle: `${log.duration_minutes}m${log.quality ? ` · ${log.quality}` : ""}`,
      date: log.date,
    });
  }
  for (const log of activityLogs
    .filter((log) => log.date >= sevenDaysAgoIso)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)) {
    recentActivity.push({
      id: `activity-${log.date}`,
      type: "activity",
      title: "Activity logged",
      subtitle: `${(log.steps ?? 0).toLocaleString()} steps`,
      date: log.date,
    });
  }
  for (const log of waterLogs
    .filter((log) => log.date >= sevenDaysAgoIso)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)) {
    recentActivity.push({
      id: `water-${log.date}-${log.amount_ml}`,
      type: "water",
      title: "Water logged",
      subtitle: `${log.amount_ml} ml`,
      date: log.date,
    });
  }
  for (const entry of nutritionEntries.slice(0, 4)) {
    recentActivity.push({
      id: `meal-${entry.food_name}-${entry.calories}-${entry.meal_type}`,
      type: "meal",
      title: "Meal logged",
      subtitle: `${entry.food_name} · ${entry.calories} kcal`,
      date: todayIso,
    });
  }

  const sortedActivity = recentActivity.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const unlockedMap = new Map(
    unlocked.map((entry) => [entry.achievement_id, entry.unlocked_at ?? ""])
  );
  const unlockedAchievements = achievements.filter((a) => unlockedMap.has(a.id));
  const lockedAchievements = achievements.filter((a) => !unlockedMap.has(a.id));
  const bmiValue =
    lastWeight != null && profile?.height_cm ? bmi(lastWeight, profile.height_cm) : null;

  const insights = buildDashboardInsights({
    hasAnyData:
      waterLogs.length > 0 ||
      activityLogs.length > 0 ||
      workouts.length > 0 ||
      weightEntries.length > 0 ||
      sleepLogs.length > 0 ||
      nutritionEntries.length > 0,
    lastWeight,
    weightChangeKg,
    workoutsThisWeek: workoutsThisWeek.length,
    workoutsLast30: workouts.length,
    avgSteps7d: Math.round(avgSteps7d),
    waterTodayMl,
    waterTargetMl,
    avgSleepMinutes7d,
    caloriesToday: nutrition.calories,
    calorieTarget: profile?.preferences?.calorie_target ?? null,
    consistency: computeConsistencyScore(activeDays, 1, 28),
  });

  return {
    firstName: profile?.full_name?.split(" ")[0] ?? "athlete",
    primaryGoal: profile?.primary_goal ?? null,
    unitSystem: profile?.unit_system ?? "metric",
    summary: {
      waterMl: waterTodayMl,
      waterTargetMl,
      steps: activityToday?.steps ?? 0,
      stepTarget,
      activeMinutes: activityToday?.active_minutes ?? 0,
      caloriesBurned: caloriesToday,
      workoutsToday: workoutsToday.length,
      workoutsThisWeek: workoutsThisWeek.length,
      workoutMinutesThisWeek: workoutsThisWeek.reduce((sum, w) => sum + (w.duration_minutes ?? 0), 0),
    },
    weightTrend: weightEntries
      .slice()
      .reverse()
      .map((entry) => ({ date: entry.date, weight_kg: entry.weight_kg })),
    workoutTrend,
    activityTrend,
    sleepTrend,
    waterTrend,
    nutrition,
    calorieTarget: profile?.preferences?.calorie_target ?? null,
    goals: goalsWithProgress,
    recentActivity: sortedActivity,
    consistency: computeConsistencyScore(activeDays, 1, 28),
    insights,
    achievements: {
      unlocked: unlockedAchievements.length,
      total: achievements.length,
      recent: unlockedAchievements.slice(0, 3).map((a) => ({
        name: a.name,
        icon: a.icon,
        unlocked_at: unlockedMap.get(a.id) ?? "",
      })),
      lockedPreview: lockedAchievements.slice(0, 4).map((a) => ({ name: a.name, icon: a.icon })),
    },
    bmi: bmiValue && bmiValue > 0 ? { value: bmiValue, category: bmiCategory(bmiValue) } : null,
    lastWeight,
    lastBodyFat: weightEntries[0]?.body_fat_percentage ?? null,
    weightChangeKg,
  };
});
