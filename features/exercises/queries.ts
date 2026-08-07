import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Exercise, MuscleGroup } from "@/types/database";

export type ExerciseFilters = {
  search?: string;
  muscleGroup?: MuscleGroup | "all";
  difficulty?: "beginner" | "intermediate" | "advanced" | "all";
};

export const getExercises = cache(
  async (filters: ExerciseFilters = {}): Promise<Exercise[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("exercises")
      .select("*")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters.muscleGroup && filters.muscleGroup !== "all") {
      query = query.eq("muscle_group", filters.muscleGroup);
    }

    if (filters.difficulty && filters.difficulty !== "all") {
      query = query.eq("difficulty", filters.difficulty);
    }

    const { data } = await query;
    return data ?? [];
  }
);
