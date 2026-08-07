import Link from "next/link";
import { ArrowLeft, Clock, Dumbbell, Flame, Route } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getWorkout } from "@/features/workouts/queries";
import { deleteWorkoutAction } from "@/features/workouts/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { workoutCategoryOptions } from "@/constants";
import { formatMinutes, formatNumber, formatKm } from "@/utils/format";
import { formatDate } from "@/utils/dates";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const workout = await getWorkout(id);

  if (!workout) {
    return (
      <div className="grid gap-6">
        <EmptyState
          icon={Dumbbell}
          title="Workout not found"
          description="This workout may have been deleted."
          action={
            <Button asChild>
              <Link href="/app/workouts">Back to workouts</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const categoryLabel =
    workoutCategoryOptions.find(
      (option) => option.value === workout.category
    )?.label ?? workout.category;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/workouts"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to workouts
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{workout.name}</h1>
            <Badge variant="secondary">{categoryLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(workout.date)}
          </p>
        </div>
        <DeleteButton action={deleteWorkoutAction} id={workout.id} label="Delete" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Duration"
          value={formatMinutes(workout.duration_minutes)}
          icon={Clock}
        />
        {workout.calories_burned ? (
          <StatCard
            title="Calories burned"
            value={formatNumber(workout.calories_burned, 0)}
            icon={Flame}
          />
        ) : null}
        {workout.distance_km != null ? (
          <StatCard
            title="Distance"
            value={formatKm(workout.distance_km)}
            icon={Route}
          />
        ) : null}
      </div>

      {workout.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          {workout.exercises.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No exercises logged"
              description="This workout doesn't have any exercises recorded."
            />
          ) : (
            <ul className="divide-y">
              {workout.exercises.map((exercise) => (
                <li key={exercise.id} className="py-2.5">
                  <p className="text-sm font-semibold">{exercise.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {exercise.sets ? `${exercise.sets} sets` : null}
                    {exercise.reps ? ` × ${exercise.reps} reps` : null}
                    {exercise.weight_kg != null
                      ? ` @ ${formatNumber(exercise.weight_kg)} kg`
                      : null}
                    {exercise.duration_minutes
                      ? ` · ${formatMinutes(exercise.duration_minutes)}`
                      : null}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
