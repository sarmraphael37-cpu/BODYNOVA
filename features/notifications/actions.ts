"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to update notification");
  revalidatePath("/app/notifications", "layout");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) throw new Error("Failed to update notifications");
  revalidatePath("/app/notifications", "layout");
}

export async function clearAllNotifications() {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id);

  if (error) throw new Error("Failed to clear notifications");
  revalidatePath("/app/notifications", "layout");
}
