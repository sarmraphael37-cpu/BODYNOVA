"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  createHabitSchema,
  type CreateHabitInput,
} from "@/features/habits/schemas";

export type HabitActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createHabitAction(
  _state: HabitActionState,
  formData: FormData
): Promise<HabitActionState> {
  const user = await requireUser();
  const parsed = createHabitSchema.safeParse({
    name: formData.get("name"),
    target_per_week: formData.get("target_per_week"),
    color: formData.get("color") ?? "",
    icon: formData.get("icon") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as CreateHabitInput;
  const supabase = await createClient();

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name: data.name,
    color: data.color || "#10b981",
    icon: data.icon || "check",
    target_per_week: data.target_per_week,
  });

  if (error) return { error: "Failed to create your habit." };

  revalidatePath("/app/habits");
  return { success: true };
}

export async function toggleHabitLogAction(
  habitId: string,
  date: string
): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("habit_logs")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);

    if (error) throw new Error("Failed to update the habit log.");
  } else {
    const { error } = await supabase.from("habit_logs").insert({
      habit_id: habitId,
      user_id: user.id,
      date,
      completed: true,
    });

    if (error) throw new Error("Failed to update the habit log.");
  }

  revalidatePath("/app/habits");
}

export async function deleteHabitAction(habitId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the habit.");

  revalidatePath("/app/habits");
}
