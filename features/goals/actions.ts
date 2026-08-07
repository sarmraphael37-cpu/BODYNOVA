"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  createGoalSchema,
  type CreateGoalInput,
} from "@/features/goals/schemas";
import type { GoalStatus } from "@/types/database";

export type GoalActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

const goalStatuses: GoalStatus[] = [
  "active",
  "completed",
  "paused",
  "abandoned",
];

export async function createGoalAction(
  _state: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const user = await requireUser();
  const parsed = createGoalSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    target_value: formData.get("target_value"),
    unit: formData.get("unit") ?? "",
    target_date: formData.get("target_date") ?? "",
    start_value: formData.get("start_value") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as CreateGoalInput;
  const supabase = await createClient();

  const { error } = await supabase.from("fitness_goals").insert({
    user_id: user.id,
    type: data.type,
    title: data.title,
    target_value: data.target_value,
    unit: data.unit || "",
    target_date: data.target_date || null,
    start_value: data.start_value ? Number(data.start_value) : 0,
  });

  if (error) return { error: "Failed to create your goal." };

  revalidatePath("/app/goals");
  return { success: true };
}

export async function updateGoalStatusAction(
  goalId: string,
  status: GoalStatus
): Promise<void> {
  const user = await requireUser();
  if (!goalStatuses.includes(status)) throw new Error("Invalid goal status.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("fitness_goals")
    .update({ status })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to update the goal.");

  revalidatePath("/app/goals");
}

export async function deleteGoalAction(goalId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("fitness_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the goal.");

  revalidatePath("/app/goals");
}
