"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  logWeightSchema,
  updateWeightSchema,
  type LogWeightInput,
} from "@/features/weight/schemas";

export type WeightActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function logWeightAction(
  _state: WeightActionState,
  formData: FormData
): Promise<WeightActionState> {
  const user = await requireUser();
  const parsed = logWeightSchema.safeParse({
    date: formData.get("date"),
    weight_kg: formData.get("weight_kg"),
    body_fat_percentage: formData.get("body_fat_percentage") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as LogWeightInput;
  const supabase = await createClient();

  const { error } = await supabase.from("weight_entries").upsert(
    {
      user_id: user.id,
      date: data.date,
      weight_kg: data.weight_kg,
      body_fat_percentage: data.body_fat_percentage
        ? Number(data.body_fat_percentage)
        : null,
      notes: data.notes || null,
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { error: "Failed to save your weight entry." };

  revalidatePath("/app/weight");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteWeightAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("weight_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the entry.");

  revalidatePath("/app/weight");
  revalidatePath("/app/dashboard");
}

export async function updateWeightAction(
  _state: WeightActionState,
  formData: FormData
): Promise<WeightActionState> {
  const user = await requireUser();
  const parsed = updateWeightSchema.safeParse({
    id: formData.get("id"),
    date: formData.get("date"),
    weight_kg: formData.get("weight_kg"),
    body_fat_percentage: formData.get("body_fat_percentage") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data as { id: string } & LogWeightInput;
  const supabase = await createClient();

  const { error } = await supabase
    .from("weight_entries")
    .update({
      date: data.date,
      weight_kg: data.weight_kg,
      body_fat_percentage: data.body_fat_percentage
        ? Number(data.body_fat_percentage)
        : null,
      notes: data.notes || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Failed to update your weight entry." };

  revalidatePath("/app/weight");
  revalidatePath("/app/dashboard");
  return { success: true };
}
