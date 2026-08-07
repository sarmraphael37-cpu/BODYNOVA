"use client";

import Link from "next/link";
import { Droplets, Footprints, Flame, Scale, Dumbbell, Plus } from "lucide-react";
import type { DashboardData } from "@/features/dashboard/queries";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WeightChart } from "@/features/dashboard/components/weight-chart";
import { WorkoutChart } from "@/features/dashboard/components/workout-chart";
import { formatKg, formatMinutes, formatMl, formatNumber } from "@/utils/format";

interface DashboardContentProps {
  data: DashboardData;
  profileName: string;
}

export function DashboardContent({ data, profileName }: DashboardContentProps) {
  const { summary, weightTrend, workoutTrend } = data;
  const firstName = profileName.split(" ")[0];

  const waterPercent = Math.min(100, Math.round((summary.waterMl / summary.waterTargetMl) * 100));
  const stepPercent = Math.min(100, Math.round((summary.steps / summary.stepTarget) * 100));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {firstName || "athlete"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your body today.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/workouts/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Log workout
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Weight"
          value={summary.lastWeight ? formatKg(summary.lastWeight) : "—"}
          icon={Scale}
          hint={summary.lastWeight ? "Latest entry" : "Log your first weight"}
        />
        <StatCard
          title="Workouts today"
          value={summary.workoutsToday > 0 ? String(summary.workoutsToday) : "0"}
          icon={Dumbbell}
          hint={summary.workoutsToday > 0 ? "Keep it up!" : "Rest day"}
        />
        <StatCard
          title="Calories burned"
          value={formatNumber(summary.caloriesBurned)}
          icon={Flame}
          hint={`${formatMinutes(summary.activeMinutes)} active`}
        />
        <StatCard
          title="Water"
          value={formatMl(summary.waterMl)}
          icon={Droplets}
          hint={`of ${formatMl(summary.waterTargetMl)} target`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Water goal</span>
            <span className="text-muted-foreground">
              {formatMl(summary.waterMl)} / {formatMl(summary.waterTargetMl)}
            </span>
          </div>
          <Progress value={waterPercent} className="h-2.5" />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <Footprints className="h-4 w-4 text-muted-foreground" aria-hidden />
              Step goal
            </span>
            <span className="text-muted-foreground">
              {formatNumber(summary.steps)} / {formatNumber(summary.stepTarget)}
            </span>
          </div>
          <Progress value={stepPercent} className="h-2.5" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Weight trend" description="Your logged weight over time">
          <WeightChart data={weightTrend} />
        </ChartCard>
        <ChartCard
          title="Workouts"
          description="Workouts over the last 30 days"
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/workouts">View all</Link>
            </Button>
          }
        >
          <WorkoutChart data={workoutTrend} />
        </ChartCard>
      </div>
    </div>
  );
}
