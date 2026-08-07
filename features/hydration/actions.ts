"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import {
  logWaterSchema,
  type LogWaterInput,
} from "@/features/hydration/schemas";

export type WaterActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function logWaterAction(
  _state: WaterActionState,
  formData: FormData
): Promise<WaterActionState> {
  const user = await requireUser();
  const parsed = logWaterSchema.safeParse({
    date: formData.get("date"),
    amount_ml: formData.get("amount_ml"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as LogWaterInput;
  const supabase = await createClient();

  const { error } = await supabase.from("water_logs").insert({
    user_id: user.id,
    date: data.date,
    amount_ml: data.amount_ml,
  });

  if (error) return { error: "Failed to save your water log." };

  revalidatePath("/app/hydration");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteWaterLogAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("water_logs")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the entry.");

  revalidatePath("/app/hydration");
  revalidatePath("/app/dashboard");
}
