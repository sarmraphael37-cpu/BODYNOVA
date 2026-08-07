"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  logBodyMeasurementSchema,
  type LogBodyMeasurementInput,
} from "@/features/body/schemas";

export type BodyActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function logBodyMeasurementAction(
  _state: BodyActionState,
  formData: FormData
): Promise<BodyActionState> {
  const user = await requireUser();
  const parsed = logBodyMeasurementSchema.safeParse({
    date: formData.get("date"),
    weight_kg: formData.get("weight_kg") ?? "",
    body_fat_percentage: formData.get("body_fat_percentage") ?? "",
    muscle_mass_kg: formData.get("muscle_mass_kg") ?? "",
    waist_cm: formData.get("waist_cm") ?? "",
    chest_cm: formData.get("chest_cm") ?? "",
    arms_cm: formData.get("arms_cm") ?? "",
    thighs_cm: formData.get("thighs_cm") ?? "",
    hips_cm: formData.get("hips_cm") ?? "",
    neck_cm: formData.get("neck_cm") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as LogBodyMeasurementInput;
  const supabase = await createClient();

  const { error } = await supabase.from("body_measurements").insert({
    user_id: user.id,
    date: data.date,
    weight_kg: data.weight_kg ? Number(data.weight_kg) : null,
    body_fat_percentage: data.body_fat_percentage
      ? Number(data.body_fat_percentage)
      : null,
    muscle_mass_kg: data.muscle_mass_kg ? Number(data.muscle_mass_kg) : null,
    waist_cm: data.waist_cm ? Number(data.waist_cm) : null,
    chest_cm: data.chest_cm ? Number(data.chest_cm) : null,
    arms_cm: data.arms_cm ? Number(data.arms_cm) : null,
    thighs_cm: data.thighs_cm ? Number(data.thighs_cm) : null,
    hips_cm: data.hips_cm ? Number(data.hips_cm) : null,
    neck_cm: data.neck_cm ? Number(data.neck_cm) : null,
    notes: data.notes || null,
  });

  if (error) return { error: "Failed to save your body measurements." };

  revalidatePath("/app/body");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteBodyMeasurementAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("body_measurements")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the entry.");

  revalidatePath("/app/body");
  revalidatePath("/app/dashboard");
}
