"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, requireAdmin } from "@/lib/dal/auth";
import { loginSchema } from "@/features/auth/schemas";

export type AdminLoginActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function adminLoginAction(
  _state: AdminLoginActionState,
  formData: FormData
): Promise<AdminLoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  let signInError: { code?: string; message?: string } | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    signInError = error;
  } catch (unexpectedError) {
    console.error("[admin] signInWithPassword threw", unexpectedError);
    return {
      error:
        "Unable to reach the sign-in service. Check your connection and try again.",
    };
  }

  if (signInError) {
    if (
      signInError.code === "email_not_confirmed" ||
      /not confirmed/i.test(signInError.message ?? "")
    ) {
      return {
        error:
          "Your email isn't confirmed yet. Check your inbox (and spam folder) for the confirmation link, then sign in again.",
      };
    }
    return { error: "Invalid email or password." };
  }

  const admin = await isAdmin();
  if (!admin) {
    await supabase.auth.signOut();
    return { error: "This account doesn't have administrator access." };
  }

  redirect("/admin/dashboard");
}

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
