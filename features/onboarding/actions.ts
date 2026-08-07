"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import { onboardingSchema, type OnboardingInput } from "@/features/onboarding/schemas";
import type { Profile, UserPreferences } from "@/types/database";

export type OnboardingActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function completeOnboardingAction(
  _state: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const user = await requireUser();

  const parsed = onboardingSchema.safeParse({
    full_name: formData.get("full_name"),
    date_of_birth: formData.get("date_of_birth"),
    gender: formData.get("gender"),
    height_cm: formData.get("height_cm"),
    weight_kg: formData.get("weight_kg"),
    unit_system: formData.get("unit_system"),
    fitness_level: formData.get("fitness_level"),
    activity_level: formData.get("activity_level"),
    primary_goal: formData.get("primary_goal"),
    water_target_ml: formData.get("water_target_ml"),
    step_target: formData.get("step_target"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as OnboardingInput;
  const supabase = await createClient();

  const profileUpdate: Partial<Profile> = {
    full_name: data.full_name,
    onboarding_completed: true,
  };
  if (data.date_of_birth) profileUpdate.date_of_birth = data.date_of_birth;
  if (data.gender) profileUpdate.gender = data.gender;
  if (data.height_cm) profileUpdate.height_cm = Number(data.height_cm);
  if (data.unit_system) profileUpdate.unit_system = data.unit_system;
  if (data.fitness_level) profileUpdate.fitness_level = data.fitness_level;
  if (data.activity_level) profileUpdate.activity_level = data.activity_level;
  if (data.primary_goal) profileUpdate.primary_goal = data.primary_goal;

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileError) {
    return { error: "We couldn't save your profile. Please try again." };
  }

  const preferencesUpdate: Partial<UserPreferences> = {
    unit_system: data.unit_system ?? "metric",
  };
  if (data.water_target_ml) preferencesUpdate.water_target_ml = Number(data.water_target_ml);
  if (data.step_target) preferencesUpdate.step_target = Number(data.step_target);

  const { error: preferencesError } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: user.id, ...preferencesUpdate },
      { onConflict: "user_id" }
    );

  if (preferencesError) {
    return { error: "We couldn't save your preferences. Please try again." };
  }

  if (data.weight_kg) {
    const today = new Date().toISOString().slice(0, 10);
    const { error: weightError } = await supabase
      .from("weight_entries")
      .upsert(
        {
          user_id: user.id,
          date: today,
          weight_kg: Number(data.weight_kg),
        },
        { onConflict: "user_id,date" }
      );
    if (!weightError) {
      await supabase
        .from("notifications")
        .insert({
          user_id: user.id,
          type: "system",
          title: "Welcome to BodyNova!",
          body: "Your setup is complete. Start tracking your first workout or weight entry.",
        });
    }
  }

  redirect("/app/dashboard");
}
