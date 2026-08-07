import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { Workout, WorkoutExercise } from "@/types/database";

export type WorkoutWithExercises = Workout & { exercises: WorkoutExercise[] };

export type WorkoutStats = {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
};

export const getWorkouts = cache(async (limit = 50): Promise<Workout[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
});

export const getWorkout = cache(
  async (id: string): Promise<WorkoutWithExercises | null> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data: workout } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!workout) return null;

    const { data: exercises } = await supabase
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", id)
      .order("created_at", { ascending: true });

    return { ...workout, exercises: exercises ?? [] };
  }
);

export const getWorkoutStats = cache(
  async (days = 30): Promise<WorkoutStats> => {
    const user = await requireUser();
    const supabase = await createClient();

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceIso = since.toISOString().slice(0, 10);

    const { data } = await supabase
      .from("workouts")
      .select("duration_minutes, calories_burned")
      .eq("user_id", user.id)
      .gte("date", sinceIso);

    const workouts = data ?? [];

    return {
      totalWorkouts: workouts.length,
      totalMinutes: workouts.reduce(
        (sum, w) => sum + (w.duration_minutes ?? 0),
        0
      ),
      totalCalories: workouts.reduce(
        (sum, w) => sum + (w.calories_burned ?? 0),
        0
      ),
    };
  }
);
