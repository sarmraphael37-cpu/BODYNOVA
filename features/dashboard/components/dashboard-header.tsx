"use client";

import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Plus,
  Scale,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fitnessGoalOptions } from "@/constants";
import type { PrimaryGoal } from "@/types/database";

interface DashboardHeaderProps {
  firstName: string;
  greeting: string;
  dateLabel: string;
  primaryGoal: PrimaryGoal | null;
  onQuickAdd: () => void;
}

const goalIcon: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  lose_weight: Flame,
  gain_weight: TrendingUp,
  build_muscle: Dumbbell,
  maintain_weight: Scale,
  improve_fitness: Activity,
  improve_endurance: HeartPulse,
  general_health: Sprout,
};

export function DashboardHeader({
  firstName,
  greeting,
  dateLabel,
  primaryGoal,
  onQuickAdd,
}: DashboardHeaderProps) {
  const goal = fitnessGoalOptions.find((option) => option.value === primaryGoal);
  const GoalIcon = primaryGoal ? goalIcon[primaryGoal] : null;

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting}, {firstName || "athlete"}
          </h1>
          {goal && (
            <Badge variant="secondary" className="gap-1">
              {GoalIcon && <GoalIcon className="h-3 w-3" aria-hidden />}
              {goal.label}
            </Badge>
          )}
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" aria-hidden />
          {dateLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onQuickAdd}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden />
          Quick add
        </Button>
        <Button asChild>
          <Link href="/app/workouts/new">
            <Dumbbell className="mr-1.5 h-4 w-4" aria-hidden />
            Log workout
          </Link>
        </Button>
      </div>
    </div>
  );
}
