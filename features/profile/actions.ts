"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/features/profile/schemas";
import type { Profile } from "@/types/database";

export type ProfileActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const user = await requireUser();
  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
    date_of_birth: formData.get("date_of_birth") ?? "",
    gender: formData.get("gender") ?? "",
    height_cm: formData.get("height_cm") ?? "",
    unit_system: formData.get("unit_system") ?? "metric",
    fitness_level: formData.get("fitness_level") ?? "",
    activity_level: formData.get("activity_level") ?? "",
    primary_goal: formData.get("primary_goal") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as UpdateProfileInput;
  const supabase = await createClient();

  const update: Partial<Profile> = {
    full_name: data.full_name,
    date_of_birth: data.date_of_birth || null,
    gender: (data.gender || null) as Profile["gender"],
    height_cm: data.height_cm ? Number(data.height_cm) : null,
    unit_system: data.unit_system,
    fitness_level: (data.fitness_level || null) as Profile["fitness_level"],
    activity_level: (data.activity_level || null) as Profile["activity_level"],
    primary_goal: (data.primary_goal || null) as Profile["primary_goal"],
  };

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) return { error: "Failed to save your profile." };

  revalidatePath("/app/profile");
  revalidatePath("/app/dashboard");
  return { success: true };
}
