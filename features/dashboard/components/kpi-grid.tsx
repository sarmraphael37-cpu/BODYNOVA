"use client";

import { Dumbbell, Droplets, Flame, Scale } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatKg, formatMl, formatMinutes, formatNumber } from "@/utils/format";
import type { DashboardData } from "@/features/dashboard/queries";

interface KpiGridProps {
  data: DashboardData;
}

export function KpiGrid({ data }: KpiGridProps) {
  const { summary, lastWeight, weightChangeKg } = data;

  const weightTrend =
    lastWeight != null && weightChangeKg != null
      ? {
          value: `${weightChangeKg > 0 ? "+" : ""}${weightChangeKg.toFixed(1)} kg`,
          direction: (weightChangeKg > 0 ? "up" : "down") as "up" | "down",
          positive: weightChangeKg < 0,
        }
      : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Weight"
        value={lastWeight ? formatKg(lastWeight) : "—"}
        icon={Scale}
        hint={lastWeight ? "Latest entry" : "Log your first weight"}
        trend={weightTrend}
      />
      <StatCard
        title="Workouts this week"
        value={summary.workoutsThisWeek > 0 ? String(summary.workoutsThisWeek) : "0"}
        icon={Dumbbell}
        hint={
          summary.workoutsToday > 0
            ? `${summary.workoutsToday} today`
            : `${formatMinutes(summary.workoutMinutesThisWeek)} this week`
        }
      />
      <StatCard
        title="Calories burned"
        value={formatNumber(summary.caloriesBurned)}
        icon={Flame}
        hint={`${formatMinutes(summary.activeMinutes)} active today`}
      />
      <StatCard
        title="Water"
        value={formatMl(summary.waterMl)}
        icon={Droplets}
        hint={`of ${formatMl(summary.waterTargetMl)} target`}
      />
    </div>
  );
}
