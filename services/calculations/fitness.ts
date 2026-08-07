import type {
  ActivityLevel,
  Gender,
  PrimaryGoal,
  UnitSystem,
} from "@/types/database";

export interface BodyProfile {
  heightCm: number;
  weightKg: number;
  age: number;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  unitSystem?: UnitSystem;
}

export interface ActivityMultiplier {
  label: string;
  multiplier: number;
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, ActivityMultiplier> = {
  sedentary: { label: "Sedentary", multiplier: 1.2 },
  light: { label: "Lightly active", multiplier: 1.375 },
  moderate: { label: "Moderately active", multiplier: 1.55 },
  active: { label: "Active", multiplier: 1.725 },
  very_active: { label: "Very active", multiplier: 1.9 },
};

export function bmi(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiCategory(value: number): string {
  if (value <= 0) return "Unknown";
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Normal";
  if (value < 30) return "Overweight";
  return "Obese";
}

export function bmrMifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender | null
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "female") return base - 161;
  return base + 5;
}

export function tdee(
  bmrValue: number,
  activityLevel: ActivityLevel | null
): number {
  if (bmrValue <= 0) return 0;
  const multiplier = activityLevel
    ? ACTIVITY_MULTIPLIERS[activityLevel].multiplier
    : ACTIVITY_MULTIPLIERS.moderate.multiplier;
  return Math.round(bmrValue * multiplier);
}

export interface CalorieTargets {
  maintain: number;
  loseMild: number;
  loseAggressive: number;
  gainMild: number;
  gainAggressive: number;
}

export function calorieTargets(tdeeValue: number): CalorieTargets {
  return {
    maintain: tdeeValue,
    loseMild: Math.round(tdeeValue - 250),
    loseAggressive: Math.round(tdeeValue - 500),
    gainMild: Math.round(tdeeValue + 250),
    gainAggressive: Math.round(tdeeValue + 500),
  };
}

export function goalCalorieAdjustment(goal: PrimaryGoal | null): number {
  switch (goal) {
    case "lose_weight":
      return -500;
    case "gain_weight":
      return +500;
    case "build_muscle":
      return +250;
    default:
      return 0;
  }
}

export function recommendedWaterTargetMl(
  weightKg: number,
  activityMinutesPerDay = 0
): number {
  if (weightKg <= 0) return 2500;
  const base = weightKg * 35;
  const activity = (activityMinutesPerDay / 30) * 350;
  return Math.round((base + activity) / 250) * 250;
}

export function safeDailyWeightChange(
  goal: PrimaryGoal | null,
  targetWeightKg: number | null,
  currentWeightKg: number
): number {
  if (goal === "lose_weight" || goal === "gain_weight") {
    if (targetWeightKg && targetWeightKg > 0) {
      return targetWeightKg - currentWeightKg;
    }
  }
  return 0;
}

export interface WeightProgress {
  current: number;
  start: number;
  target: number | null;
  totalChange: number;
  remaining: number;
  progressPercent: number;
  avgWeeklyChange: number;
  projectedGoalDate: Date | null;
  onTrack: boolean | null;
}

export function computeWeightProgress(
  entries: { date: string; weight_kg: number }[],
  targetWeightKg: number | null,
  startDate: string
): WeightProgress {
  if (entries.length === 0) {
    return {
      current: 0,
      start: 0,
      target: targetWeightKg,
      totalChange: 0,
      remaining: 0,
      progressPercent: 0,
      avgWeeklyChange: 0,
      projectedGoalDate: null,
      onTrack: null,
    };
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const current = sorted[sorted.length - 1].weight_kg;
  const start = sorted[0].weight_kg;
  const totalChange = current - start;

  const firstDate = new Date(sorted[0].date);
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const startDateObj = new Date(startDate);
  const effectiveStart = firstDate < startDateObj ? firstDate : startDateObj;

  const elapsedDays = Math.max(
    1,
    (lastDate.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgWeeklyChange = totalChange / (elapsedDays / 7);

  if (!targetWeightKg || targetWeightKg <= 0) {
    return {
      current,
      start,
      target: null,
      totalChange,
      remaining: 0,
      progressPercent: 0,
      avgWeeklyChange,
      projectedGoalDate: null,
      onTrack: null,
    };
  }

  const remaining = targetWeightKg - current;
  const totalPlannedChange = targetWeightKg - start;
  const progressPercent =
    totalPlannedChange === 0
      ? 100
      : Math.max(0, Math.min(100, Math.abs(totalChange / totalPlannedChange) * 100));

  const needsChange = Math.abs(remaining) > 0.05;
  const weeklyRate = Math.abs(avgWeeklyChange);
  let projectedGoalDate: Date | null = null;
  let onTrack: boolean | null = null;

  if (needsChange && weeklyRate > 0.001) {
    const weeksToGoal = Math.abs(remaining) / weeklyRate;
    projectedGoalDate = new Date(
      lastDate.getTime() + weeksToGoal * 7 * 24 * 60 * 60 * 1000
    );
    // Moving in the correct direction.
    const movingTowardTarget =
      (remaining < 0 && avgWeeklyChange < 0) ||
      (remaining > 0 && avgWeeklyChange > 0);
    onTrack = movingTowardTarget;
  }

  return {
    current,
    start,
    target: targetWeightKg,
    totalChange,
    remaining,
    progressPercent,
    avgWeeklyChange,
    projectedGoalDate,
    onTrack,
  };
}

export interface GoalProgress {
  progressValue: number;
  targetValue: number;
  percent: number;
  remaining: number;
  isComplete: boolean;
}

export function computeGoalProgress(
  startValue: number,
  currentValue: number,
  targetValue: number
): GoalProgress {
  const totalPlanned = Math.abs(targetValue - startValue);
  const achieved = Math.abs(currentValue - startValue);
  const percent =
    totalPlanned === 0
      ? 100
      : Math.max(0, Math.min(100, (achieved / totalPlanned) * 100));

  return {
    progressValue: currentValue,
    targetValue,
    percent: Math.round(percent),
    remaining: targetValue - currentValue,
    isComplete: percent >= 100,
  };
}

export function computeConsistencyScore(
  completedDays: string[],
  targetDays: number,
  windowDays = 28
): number {
  const today = new Date();
  const cutoff = new Date(today.getTime() - (windowDays - 1) * 24 * 60 * 60 * 1000);
  const validDays = completedDays.filter(
    (d) => new Date(d) >= cutoff && new Date(d) <= today
  );
  const uniqueDays = new Set(validDays.map((d) => new Date(d).toDateString()));
  const maxScore = windowDays * Math.max(1, targetDays);
  return Math.min(
    100,
    Math.round((uniqueDays.size / Math.max(1, maxScore)) * 100 * Math.max(1, targetDays))
  );
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function convertWeightToUnit(
  kg: number,
  unitSystem: UnitSystem = "metric"
): { value: number; unit: string } {
  if (unitSystem === "imperial") {
    return { value: kg * 2.2046226218, unit: "lb" };
  }
  return { value: kg, unit: "kg" };
}

export function convertHeightToUnit(
  cm: number,
  unitSystem: UnitSystem = "metric"
): { value: number; unit: string } {
  if (unitSystem === "imperial") {
    return { value: cm / 2.54, unit: "in" };
  }
  return { value: cm, unit: "cm" };
}
