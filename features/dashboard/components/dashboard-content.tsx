"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/ui/chart-card";
import { DashboardMotion } from "@/features/dashboard/components/dashboard-motion";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { KpiGrid } from "@/features/dashboard/components/kpi-grid";
import { DailyGoals } from "@/features/dashboard/components/daily-goals";
import { BodyMetricsCard } from "@/features/dashboard/components/body-metrics-card";
import { WeightChart } from "@/features/dashboard/components/weight-chart";
import { WorkoutChart } from "@/features/dashboard/components/workout-chart";
import { SleepCard } from "@/features/dashboard/components/sleep-card";
import { ActivityCard } from "@/features/dashboard/components/activity-card";
import { NutritionCard } from "@/features/dashboard/components/nutrition-card";
import { DailyCoach } from "@/features/dashboard/components/daily-coach";
import { ConsistencyCard } from "@/features/dashboard/components/consistency-card";
import { AchievementsPanel } from "@/features/dashboard/components/achievements-panel";
import { GoalsCard } from "@/features/dashboard/components/goals-card";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { QuickAddDialog } from "@/features/dashboard/components/quick-add-dialog";
import type { DashboardData } from "@/features/dashboard/queries";

interface DashboardContentProps {
  data: DashboardData;
  greeting: string;
  dateLabel: string;
  initialQuickAdd?: boolean;
}

export function DashboardContent({
  data,
  greeting,
  dateLabel,
  initialQuickAdd = false,
}: DashboardContentProps) {
  const router = useRouter();
  const [quickOpen, setQuickOpen] = React.useState(initialQuickAdd);

  function handleQuickAddChange(open: boolean) {
    setQuickOpen(open);
    if (!open && initialQuickAdd) {
      router.replace("/app/dashboard", { scroll: false });
    }
  }

  return (
    <div className="grid gap-6">
      <DashboardMotion>
        <DashboardHeader
          firstName={data.firstName}
          greeting={greeting}
          dateLabel={dateLabel}
          primaryGoal={data.primaryGoal}
          onQuickAdd={() => setQuickOpen(true)}
        />
      </DashboardMotion>

      <DashboardMotion delay={0.05}>
        <KpiGrid data={data} />
      </DashboardMotion>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardMotion delay={0.1} className="lg:col-span-2">
          <DailyGoals summary={data.summary} />
        </DashboardMotion>
        <DashboardMotion delay={0.15}>
          <BodyMetricsCard
            bmi={data.bmi}
            lastWeight={data.lastWeight}
            lastBodyFat={data.lastBodyFat}
            weightChangeKg={data.weightChangeKg}
          />
        </DashboardMotion>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardMotion delay={0.1}>
          <ChartCard title="Weight trend" description="Your logged weight over time">
            <WeightChart data={data.weightTrend} />
          </ChartCard>
        </DashboardMotion>
        <DashboardMotion delay={0.15}>
          <ChartCard
            title="Workouts"
            description="Workouts over the last 30 days"
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/workouts">View all</Link>
              </Button>
            }
          >
            <WorkoutChart data={data.workoutTrend} />
          </ChartCard>
        </DashboardMotion>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardMotion delay={0.1}>
          <SleepCard data={data.sleepTrend} />
        </DashboardMotion>
        <DashboardMotion delay={0.15}>
          <ActivityCard data={data.activityTrend} todaySteps={data.summary.steps} />
        </DashboardMotion>
        <DashboardMotion delay={0.2}>
          <NutritionCard data={data.nutrition} calorieTarget={data.calorieTarget} />
        </DashboardMotion>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardMotion delay={0.1} className="lg:col-span-2">
          <DailyCoach insights={data.insights} />
        </DashboardMotion>
        <DashboardMotion delay={0.15}>
          <ConsistencyCard value={data.consistency} />
        </DashboardMotion>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DashboardMotion delay={0.1}>
          <AchievementsPanel data={data.achievements} />
        </DashboardMotion>
        <DashboardMotion delay={0.15}>
          <GoalsCard goals={data.goals} />
        </DashboardMotion>
        <DashboardMotion delay={0.2}>
          <RecentActivity items={data.recentActivity} />
        </DashboardMotion>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4">
        <div>
          <p className="text-sm font-medium">Ready for your next session?</p>
          <p className="text-sm text-muted-foreground">
            Log a full workout with sets, reps, and weights.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/workouts/new">
            <Dumbbell className="mr-1.5 h-4 w-4" aria-hidden />
            Start workout
          </Link>
        </Button>
      </div>

      <QuickAddDialog open={quickOpen} onOpenChange={handleQuickAddChange} />
    </div>
  );
}
