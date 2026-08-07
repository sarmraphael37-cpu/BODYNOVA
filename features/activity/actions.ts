"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  logActivitySchema,
  type LogActivityInput,
} from "@/features/activity/schemas";

export type ActivityActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function logActivityAction(
  _state: ActivityActionState,
  formData: FormData
): Promise<ActivityActionState> {
  const user = await requireUser();
  const parsed = logActivitySchema.safeParse({
    date: formData.get("date"),
    steps: formData.get("steps"),
    distance_km: formData.get("distance_km") ?? "",
    active_minutes: formData.get("active_minutes") ?? "",
    calories_burned: formData.get("calories_burned") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as LogActivityInput;
  const supabase = await createClient();

  const { error } = await supabase.from("activity_logs").upsert(
    {
      user_id: user.id,
      date: data.date,
      steps: data.steps,
      distance_km: data.distance_km ? Number(data.distance_km) : 0,
      active_minutes: data.active_minutes ? Number(data.active_minutes) : 0,
      calories_burned: data.calories_burned ? Number(data.calories_burned) : 0,
      source: "manual",
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { error: "Failed to save your activity." };

  revalidatePath("/app/activity");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteActivityAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("activity_logs")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the entry.");

  revalidatePath("/app/activity");
  revalidatePath("/app/dashboard");
}
