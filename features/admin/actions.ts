"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal/auth";

export async function toggleExerciseStatusAction(exerciseId: string): Promise<void> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: exercise, error: fetchError } = await supabase
    .from("exercises")
    .select("id, name, status")
    .eq("id", exerciseId)
    .maybeSingle();

  if (fetchError || !exercise) {
    throw new Error("Exercise not found.");
  }

  const newStatus = exercise.status === "active" ? "inactive" : "active";

  const { error: updateError } = await supabase
    .from("exercises")
    .update({ status: newStatus })
    .eq("id", exerciseId);

  if (updateError) throw new Error("Failed to update the exercise.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: `exercise_${newStatus}`,
    entity_type: "exercise",
    entity_id: exerciseId,
    metadata: { name: exercise.name },
  });

  revalidatePath("/admin/exercises");
}

export async function deleteExerciseAction(exerciseId: string): Promise<void> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: exercise, error: fetchError } = await supabase
    .from("exercises")
    .select("id, name")
    .eq("id", exerciseId)
    .maybeSingle();

  if (fetchError || !exercise) {
    throw new Error("Exercise not found.");
  }

  const { error: deleteError } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId);

  if (deleteError) throw new Error("Failed to delete the exercise.");

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "exercise_deleted",
    entity_type: "exercise",
    entity_id: exerciseId,
    metadata: { name: exercise.name },
  });

  revalidatePath("/admin/exercises");
}
