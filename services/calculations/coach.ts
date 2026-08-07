import {
  bmi as bmiFn,
  bmiCategory as bmiCategoryFn,
} from "@/services/calculations/fitness";

// ---------------------------------------------------------------------------
// Pure, deterministic derivations of coaching metrics from raw tracking rows.
// No I/O — kept dependency-free so they are trivially unit-testable.
// ---------------------------------------------------------------------------

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isoDaysAgo(today: string, days: number): string {
  const d = new Date(`${today}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return toIso(d);
}

export type WeightPoint = { date: string; weightKg: number };

export type WeightMetrics = {
  currentKg: number | null;
  change7dKg: number | null;
  change30dKg: number | null;
  bmi: number | null;
  bmiCategory: string | null;
  lastRecordedDate: string | null;
};

export function computeWeightMetrics(
  entries: WeightPoint[],
  today: string,
  heightCm: number | null
): WeightMetrics {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    return {
      currentKg: null,
      change7dKg: null,
      change30dKg: null,
      bmi: null,
      bmiCategory: null,
      lastRecordedDate: null,
    };
  }

  const currentEntry = sorted[sorted.length - 1];
  const currentKg = currentEntry.weightKg;
  const cutoff7 = isoDaysAgo(today, 6);
  const cutoff30 = isoDaysAgo(today, 29);

  const oldest7 = sorted.find((e) => e.date >= cutoff7);
  const oldest30 = sorted.find((e) => e.date >= cutoff30);

  const round1 = (n: number) => Math.round(n * 10) / 10;
  const changeSince = (baseline: WeightPoint | undefined) =>
    baseline && baseline.date !== currentEntry.date ? round1(currentKg - baseline.weightKg) : null;
  const change7dKg = changeSince(oldest7);
  const change30dKg = changeSince(oldest30);

  const bmi = currentKg > 0 && heightCm ? bmiFn(currentKg, heightCm) : null;

  return {
    currentKg,
    change7dKg,
    change30dKg,
    bmi,
    bmiCategory: bmi && bmi > 0 ? bmiCategoryFn(bmi) : null,
    lastRecordedDate: sorted[sorted.length - 1].date,
  };
}

export type WorkoutRow = {
  date: string;
  category: string;
  durationMinutes: number;
};

export type WorkoutMetrics = {
  last7d: number;
  last30d: number;
  perWeek: number;
  minutesLast30d: number;
  categories: Record<string, number>;
};

export function computeWorkoutMetrics(workouts: WorkoutRow[], today: string): WorkoutMetrics {
  const cutoff7 = isoDaysAgo(today, 6);
  const cutoff30 = isoDaysAgo(today, 29);

  const inWindow = (date: string, cutoff: string) => date >= cutoff && date <= today;
  const last30 = workouts.filter((w) => inWindow(w.date, cutoff30));

  const categories: Record<string, number> = {};
  for (const w of last30) {
    categories[w.category] = (categories[w.category] ?? 0) + 1;
  }

  return {
    last7d: last30.filter((w) => inWindow(w.date, cutoff7)).length,
    last30d: last30.length,
    perWeek: Math.round((last30.length / 4.3) * 10) / 10,
    minutesLast30d: last30.reduce((sum, w) => sum + w.durationMinutes, 0),
    categories,
  };
}

export type ActivityRow = {
  date: string;
  steps: number;
  activeMinutes: number;
};

export type ActivityMetrics = {
  avgSteps7d: number;
  activeMinutes7d: number;
  daysLogged7d: number;
  daysLogged30d: number;
};

export function computeActivityMetrics(activity: ActivityRow[], today: string): ActivityMetrics {
  const cutoff7 = isoDaysAgo(today, 6);
  const cutoff30 = isoDaysAgo(today, 29);
  const last7 = activity.filter((a) => a.date >= cutoff7 && a.date <= today);
  const last30 = activity.filter((a) => a.date >= cutoff30 && a.date <= today);

  const avgSteps7d =
    last7.length > 0
      ? Math.round(last7.reduce((sum, a) => sum + a.steps, 0) / last7.length)
      : 0;

  return {
    avgSteps7d,
    activeMinutes7d: last7.reduce((sum, a) => sum + a.activeMinutes, 0),
    daysLogged7d: last7.length,
    daysLogged30d: last30.length,
  };
}

export type SleepRow = { date: string; durationMinutes: number; quality: string | null };

export type SleepMetrics = {
  avgMinutes7d: number | null;
  daysLogged7d: number;
  avgQuality: string | null;
};

export function computeSleepMetrics(sleep: SleepRow[], today: string): SleepMetrics {
  const cutoff7 = isoDaysAgo(today, 6);
  const last7 = sleep.filter((s) => s.date >= cutoff7 && s.date <= today);

  const avgMinutes7d =
    last7.length > 0
      ? Math.round(last7.reduce((sum, s) => sum + s.durationMinutes, 0) / last7.length)
      : null;

  const qualities = last7
    .map((s) => s.quality)
    .filter((q): q is string => Boolean(q));
  const counts = new Map<string, number>();
  for (const q of qualities) counts.set(q, (counts.get(q) ?? 0) + 1);
  let avgQuality: string | null = null;
  let best = 0;
  for (const [quality, count] of counts) {
    if (count > best) {
      best = count;
      avgQuality = quality;
    }
  }

  return { avgMinutes7d, daysLogged7d: last7.length, avgQuality };
}

export type WaterRow = { date: string; amountMl: number };

export type WaterMetrics = {
  todayMl: number;
  avgPerDay7d: number;
  daysLogged7d: number;
  daysHitTarget7d: number;
  targetMl: number;
};

export function computeWaterMetrics(
  water: WaterRow[],
  today: string,
  targetMl: number,
  windowDays = 7
): WaterMetrics {
  const cutoff = isoDaysAgo(today, windowDays - 1);
  const inWindow = water.filter((w) => w.date >= cutoff && w.date <= today);

  const byDay = new Map<string, number>();
  for (const w of inWindow) {
    byDay.set(w.date, (byDay.get(w.date) ?? 0) + w.amountMl);
  }

  const todayMl = byDay.get(today) ?? 0;
  const days = byDay.size;
  const total = Array.from(byDay.values()).reduce((sum, v) => sum + v, 0);
  let daysHitTarget = 0;
  for (const value of byDay.values()) {
    if (value >= targetMl) daysHitTarget += 1;
  }

  return {
    todayMl,
    avgPerDay7d: days > 0 ? Math.round(total / days) : 0,
    daysLogged7d: days,
    daysHitTarget7d: daysHitTarget,
    targetMl,
  };
}

export type HabitRow = { id: string; name: string; targetPerWeek: number };
export type HabitLogRow = { habitId: string; date: string; completed: boolean };

export type HabitMetric = {
  id: string;
  name: string;
  targetPerWeek: number;
  completionRate: number;
};

export function computeHabitMetrics(
  habits: HabitRow[],
  logs: HabitLogRow[],
  today: string,
  windowDays = 7
): HabitMetric[] {
  const cutoff = isoDaysAgo(today, windowDays - 1);
  const inWindow = logs.filter((l) => l.date >= cutoff && l.date <= today);

  return habits.map((habit) => {
    const habitLogs = inWindow.filter((l) => l.habitId === habit.id);
    const completed = habitLogs.filter((l) => l.completed).length;
    const expected = Math.min(windowDays, habit.targetPerWeek);
    const completionRate = Math.round(
      Math.min(1, completed / Math.max(1, expected)) * 100
    );
    return {
      id: habit.id,
      name: habit.name,
      targetPerWeek: habit.targetPerWeek,
      completionRate,
    };
  });
}

export type NutritionRow = { date: string; calories: number; proteinG: number };

export type NutritionMetrics = {
  avgCalories7d: number;
  avgProteinG7d: number;
  daysLogged7d: number;
};

export function computeNutritionMetrics(
  entries: NutritionRow[],
  today: string,
  windowDays = 7
): NutritionMetrics {
  const cutoff = isoDaysAgo(today, windowDays - 1);
  const inWindow = entries.filter((e) => e.date >= cutoff && e.date <= today);

  const byDay = new Map<string, { calories: number; proteinG: number }>();
  for (const e of inWindow) {
    const existing = byDay.get(e.date) ?? { calories: 0, proteinG: 0 };
    existing.calories += e.calories;
    existing.proteinG += e.proteinG;
    byDay.set(e.date, existing);
  }

  const days = byDay.size;
  if (days === 0) {
    return { avgCalories7d: 0, avgProteinG7d: 0, daysLogged7d: 0 };
  }

  const totalCalories = Array.from(byDay.values()).reduce((s, d) => s + d.calories, 0);
  const totalProtein = Array.from(byDay.values()).reduce((s, d) => s + d.proteinG, 0);

  return {
    avgCalories7d: Math.round(totalCalories / days),
    avgProteinG7d: Math.round(totalProtein / days),
    daysLogged7d: days,
  };
}
