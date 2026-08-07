import type { Metadata } from "next";
import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getWorkouts, getWorkoutStats } from "@/features/workouts/queries";
import { WorkoutListItem } from "@/features/workouts/components/workout-list-item";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { formatMinutes, formatNumber } from "@/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workouts",
  description: "Your workout history and recent sessions.",
};

export default async function WorkoutsPage() {
  await requireProfile();
  const [workouts, stats] = await Promise.all([
    getWorkouts(),
    getWorkoutStats(30),
  ]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
          <p className="text-sm text-muted-foreground">
            Log your training sessions and track progress over time.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/workouts/new">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            New workout
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Workouts this month"
          value={formatNumber(stats.totalWorkouts, 0)}
          icon={Dumbbell}
          hint="Last 30 days"
        />
        <StatCard
          title="Total minutes"
          value={formatMinutes(stats.totalMinutes)}
          hint="Last 30 days"
        />
        <StatCard
          title="Calories burned"
          value={formatNumber(stats.totalCalories, 0)}
          hint="Last 30 days"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          {workouts.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No workouts yet"
              description="Log your first workout to start tracking your training."
              action={
                <Button asChild>
                  <Link href="/app/workouts/new">
                    <Plus className="mr-1.5 h-4 w-4" aria-hidden />
                    New workout
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y">
              {workouts.map((workout) => (
                <WorkoutListItem
                  key={workout.id}
                  workout={workout}
                  href={`/app/workouts/${workout.id}`}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
