"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import { logSleepSchema, type LogSleepInput } from "@/features/sleep/schemas";

export type SleepActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function logSleepAction(
  _state: SleepActionState,
  formData: FormData
): Promise<SleepActionState> {
  const user = await requireUser();
  const parsed = logSleepSchema.safeParse({
    date: formData.get("date"),
    duration_minutes: formData.get("duration_minutes"),
    quality: formData.get("quality") ?? "",
    notes: formData.get("notes") ?? "",
    bedtime: formData.get("bedtime") ?? "",
    wake_time: formData.get("wake_time") ?? "",
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data as LogSleepInput;
  const supabase = await createClient();

  const { error } = await supabase.from("sleep_logs").upsert(
    {
      user_id: user.id,
      date: data.date,
      duration_minutes: data.duration_minutes,
      quality: data.quality || null,
      notes: data.notes || null,
      bedtime: data.bedtime ? new Date(data.bedtime).toISOString() : null,
      wake_time: data.wake_time ? new Date(data.wake_time).toISOString() : null,
    },
    { onConflict: "user_id,date" }
  );

  if (error) return { error: "Failed to save your sleep entry." };

  revalidatePath("/app/sleep");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteSleepLogAction(entryId: string): Promise<void> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("sleep_logs")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to delete the entry.");

  revalidatePath("/app/sleep");
  revalidatePath("/app/dashboard");
}
