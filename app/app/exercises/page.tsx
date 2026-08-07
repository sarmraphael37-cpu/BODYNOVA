import type { Metadata } from "next";
import { Clock, Dumbbell } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getExercises } from "@/features/exercises/queries";
import { ExercisesFilter } from "@/features/exercises/components/exercises-filter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMinutes } from "@/utils/format";
import type { Exercise, MuscleGroup } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Exercises",
  description: "Browse the exercise library and discover new movements.",
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

const difficultyLabels: Record<Exercise["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const difficultyVariants: Record<
  Exercise["difficulty"],
  "secondary" | "outline" | "destructive"
> = {
  beginner: "secondary",
  intermediate: "outline",
  advanced: "destructive",
};

export default async function ExercisesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; muscle?: string; difficulty?: string }>;
}) {
  await requireProfile();
  const params = await searchParams;

  const filters = {
    search: params?.q?.trim() ?? undefined,
    muscleGroup: params?.muscle as MuscleGroup | "all" | undefined,
    difficulty: params?.difficulty as Exercise["difficulty"] | "all" | undefined,
  };

  const exercises = await getExercises(filters);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
        <p className="text-sm text-muted-foreground">
          Browse the BodyNova exercise library to discover new movements.
        </p>
      </div>

      <ExercisesFilter />

      {exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No exercises found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{exercise.name}</CardTitle>
                  <Badge variant={difficultyVariants[exercise.difficulty]}>
                    {difficultyLabels[exercise.difficulty]}
                  </Badge>
                </div>
                {exercise.description && (
                  <CardDescription>{exercise.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto space-y-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {muscleGroupLabels[exercise.muscle_group]}
                  </Badge>
                  {exercise.equipment && (
                    <span className="text-muted-foreground">
                      {exercise.equipment}
                    </span>
                  )}
                  {exercise.duration_minutes != null && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {formatMinutes(exercise.duration_minutes)}
                    </span>
                  )}
                </div>
                {exercise.instructions && (
                  <p className="line-clamp-3 text-xs text-muted-foreground">
                    {exercise.instructions}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
