"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  logFoodEntrySchema,
  createCustomFoodSchema,
  type LogFoodEntryInput,
  type CreateCustomFoodInput,
} from "@/features/nutrition/schemas";

export type NutritionActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function logFoodEntryAction(
  _state: NutritionActionState,
  formData: FormData
): Promise<NutritionActionState> {
  const user = await requireUser();
  const parsed = logFoodEntrySchema.safeParse({
    date: formData.get("date"),
    meal_type: formData.get("meal_type"),
    food_id: formData.get("food_id") ?? "",
    food_name: formData.get("food_name"),
    servings: formData.get("servings"),
    calories: formData.get("calories"),
    protein_g: formData.get("protein_g") ?? "",
    carbs_g: formData.get("carbs_g") ?? "",
    fat_g: formData.get("fat_g") ?? "",
    fiber_g: formData.get("fiber_g") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as LogFoodEntryInput;
  const supabase = await createClient();

  const { error } = await supabase.from("nutrition_entries").insert({
    user_id: user.id,
    date: data.date,
    meal_type: data.meal_type,
    food_id: data.food_id || null,
    food_name: data.food_name,
    servings: data.servings,
    calories: data.calories,
    protein_g: data.protein_g ? Number(data.protein_g) : 0,
    carbs_g: data.carbs_g ? Number(data.carbs_g) : 0,
    fat_g: data.fat_g ? Number(data.fat_g) : 0,
    fiber_g: data.fiber_g ? Number(data.fiber_g) : 0,
  });

  if (error) return { error: "Failed to log your food entry." };

  revalidatePath("/app/nutrition");
  return { success: true };
}

export async function deleteFoodEntryAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("nutrition_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the entry.");

  revalidatePath("/app/nutrition");
}

export async function createCustomFoodAction(
  _state: NutritionActionState,
  formData: FormData
): Promise<NutritionActionState> {
  await requireUser();
  const parsed = createCustomFoodSchema.safeParse({
    name: formData.get("name"),
    serving_size: formData.get("serving_size") ?? "",
    serving_unit: formData.get("serving_unit") ?? "",
    calories_per_serving: formData.get("calories_per_serving"),
    protein_g: formData.get("protein_g") ?? "",
    carbs_g: formData.get("carbs_g") ?? "",
    fat_g: formData.get("fat_g") ?? "",
    fiber_g: formData.get("fiber_g") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as CreateCustomFoodInput;
  const supabase = await createClient();

  const { error } = await supabase.from("nutrition_foods").insert({
    name: data.name,
    serving_size: data.serving_size,
    serving_unit: data.serving_unit || "serving",
    calories_per_serving: data.calories_per_serving,
    protein_g: data.protein_g ? Number(data.protein_g) : 0,
    carbs_g: data.carbs_g ? Number(data.carbs_g) : 0,
    fat_g: data.fat_g ? Number(data.fat_g) : 0,
    fiber_g: data.fiber_g ? Number(data.fiber_g) : 0,
    source: "manual",
    status: "active",
  });

  if (error) return { error: "Failed to save your custom food." };

  revalidatePath("/app/nutrition");
  return { success: true };
}
