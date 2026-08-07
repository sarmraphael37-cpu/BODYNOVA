"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  createWorkoutSchema,
  type CreateWorkoutInput,
} from "@/features/workouts/schemas";

export type WorkoutActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createWorkoutAction(
  _state: WorkoutActionState,
  formData: FormData
): Promise<WorkoutActionState> {
  const user = await requireUser();

  let exercisesJson: unknown = [];
  try {
    exercisesJson = JSON.parse(String(formData.get("exercises") ?? "[]"));
  } catch {
    exercisesJson = [];
  }

  const parsed = createWorkoutSchema.safeParse({
    date: formData.get("date"),
    name: formData.get("name"),
    category: formData.get("category"),
    duration_minutes: formData.get("duration_minutes"),
    calories_burned: formData.get("calories_burned") ?? "",
    distance_km: formData.get("distance_km") ?? "",
    notes: formData.get("notes") ?? "",
    exercises: exercisesJson,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as CreateWorkoutInput;
  const supabase = await createClient();

  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      date: data.date,
      name: data.name,
      category: data.category,
      duration_minutes: data.duration_minutes,
      calories_burned: data.calories_burned
        ? Number(data.calories_burned)
        : null,
      distance_km: data.distance_km ? Number(data.distance_km) : null,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (error || !workout) return { error: "Failed to save your workout." };

  const exercises = (data.exercises ?? []).filter(
    (row) => row.name.trim().length > 0
  );

  if (exercises.length > 0) {
    const { error: exerciseError } = await supabase
      .from("workout_exercises")
      .insert(
        exercises.map((row) => ({
          workout_id: workout.id,
          exercise_id: row.exercise_id ? row.exercise_id : null,
          name: row.name,
          sets: row.sets ? Number(row.sets) : null,
          reps: row.reps ? Number(row.reps) : null,
          weight_kg: row.weight_kg ? Number(row.weight_kg) : null,
        }))
      );

    if (exerciseError) return { error: "Failed to save workout exercises." };
  }

  revalidatePath("/app/workouts");
  return { success: true };
}

export async function deleteWorkoutAction(workoutId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the workout.");

  revalidatePath("/app/workouts");
}
