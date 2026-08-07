import type { Metadata } from "next";
import { Dumbbell } from "lucide-react";
import { getAllExercises } from "@/features/admin/queries";
import { ExerciseActions } from "@/features/admin/components/exercise-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMinutes } from "@/utils/format";
import type { MuscleGroup } from "@/types/database";

export const metadata: Metadata = {
  title: "Exercises",
};

const muscleGroupLabels: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  full_body: "Full body",
  cardio: "Cardio",
};

export default async function AdminExercisesPage() {
  const exercises = await getAllExercises();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
        <p className="text-sm text-muted-foreground">
          Manage the exercise catalog shown to all users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exercise catalog</CardTitle>
          <CardDescription>
            Toggle visibility to hide an exercise from the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No exercises"
              description="Add exercises to the catalog to get started."
            />
          ) : (
            <ul className="divide-y">
              {exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{exercise.name}</p>
                      <Badge variant={exercise.status === "active" ? "success" : "secondary"}>
                        {exercise.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {muscleGroupLabels[exercise.muscle_group]} ·{" "}
                      {exercise.difficulty}
                      {exercise.duration_minutes != null
                        ? ` · ${formatMinutes(exercise.duration_minutes)}`
                        : ""}
                    </p>
                  </div>
                  <ExerciseActions
                    exerciseId={exercise.id}
                    status={exercise.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
