"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  updatePreferencesSchema,
  type UpdatePreferencesInput,
} from "@/features/settings/schemas";
import type { UserPreferences } from "@/types/database";

export type PreferencesActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function updatePreferencesAction(
  _state: PreferencesActionState,
  formData: FormData
): Promise<PreferencesActionState> {
  const user = await requireUser();
  const parsed = updatePreferencesSchema.safeParse({
    theme: formData.get("theme") ?? "system",
    unit_system: formData.get("unit_system") ?? "metric",
    water_target_ml: formData.get("water_target_ml") ?? "",
    step_target: formData.get("step_target") ?? "",
    calorie_target: formData.get("calorie_target") ?? "",
    workout_reminders: formData.get("workout_reminders") ?? false,
    water_reminders: formData.get("water_reminders") ?? false,
    weight_reminders: formData.get("weight_reminders") ?? false,
    goal_notifications: formData.get("goal_notifications") ?? false,
    achievement_notifications: formData.get("achievement_notifications") ?? false,
    weekly_reports: formData.get("weekly_reports") ?? false,
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as UpdatePreferencesInput;
  const supabase = await createClient();

  const update: Partial<UserPreferences> = {
    theme: data.theme,
    unit_system: data.unit_system,
    notification_settings: {
      workout_reminders: data.workout_reminders ?? false,
      water_reminders: data.water_reminders ?? false,
      weight_reminders: data.weight_reminders ?? false,
      goal_notifications: data.goal_notifications ?? false,
      achievement_notifications: data.achievement_notifications ?? false,
      weekly_reports: data.weekly_reports ?? false,
    },
  };
  if (data.water_target_ml) update.water_target_ml = Number(data.water_target_ml);
  if (data.step_target) update.step_target = Number(data.step_target);
  if (data.calorie_target) update.calorie_target = Number(data.calorie_target);

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: user.id, ...update }, { onConflict: "user_id" });

  if (error) return { error: "Failed to save your preferences." };

  revalidatePath("/app/settings");
  return { success: true };
}
