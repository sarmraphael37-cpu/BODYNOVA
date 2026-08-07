import { computeGoalProgress } from "@/services/calculations/fitness";
import type { GoalProgressValue } from "@/features/ai-coach/lib/types";

type GoalRow = {
  id: string;
  type: string;
  title: string;
  target_value: number;
  start_value: number;
  unit: string;
  status: string;
};

export type GoalCurrentValues = {
  currentWeightKg: number | null;
  avgSteps7d: number;
  workouts7d: number;
  waterTodayMl: number;
  avgSleepMinutes7d: number | null;
  distance7dKm: number | null;
};

export function computeGoalProgressValues(
  goals: GoalRow[],
  current: GoalCurrentValues
): GoalProgressValue[] {
  const currentValueFor = (type: string): number | null => {
    switch (type) {
      case "weight":
        return current.currentWeightKg;
      case "steps":
        return current.avgSteps7d > 0 ? current.avgSteps7d : null;
      case "workouts":
        return current.workouts7d > 0 ? current.workouts7d : null;
      case "water":
        return current.waterTodayMl > 0 ? current.waterTodayMl : null;
      case "sleep":
        return current.avgSleepMinutes7d;
      case "distance":
        return current.distance7dKm != null && current.distance7dKm > 0
          ? Math.round(current.distance7dKm * 100) / 100
          : null;
      case "habit":
        return null;
      default:
        return null;
    }
  };

  return goals.map((goal) => {
    const currentValue = currentValueFor(goal.type);
    return {
      id: goal.id,
      type: goal.type,
      title: goal.title,
      current: currentValue,
      target: Number(goal.target_value),
      percent:
        currentValue != null
          ? computeGoalProgress(Number(goal.start_value), currentValue, Number(goal.target_value))
              .percent
          : 0,
      status: goal.status,
    };
  });
}
