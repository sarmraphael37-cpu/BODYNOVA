import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal/auth";
import type { Profile, Exercise, AuditLog } from "@/types/database";

export type AdminStats = {
  userCount: number;
  adminCount: number;
  activeExerciseCount: number;
  achievementCount: number;
  recentSignups: Pick<Profile, "id" | "email" | "full_name" | "onboarding_completed" | "created_at">[];
};

export const getAdminStats = cache(async (): Promise<AdminStats> => {
  await requireAdmin();
  const supabase = await createClient();

  const [usersRes, adminsRes, exercisesRes, achievementsRes, signupsRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin"),
      supabase
        .from("exercises")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("achievements")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id, email, full_name, onboarding_completed, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  return {
    userCount: usersRes.count ?? 0,
    adminCount: adminsRes.count ?? 0,
    activeExerciseCount: exercisesRes.count ?? 0,
    achievementCount: achievementsRes.count ?? 0,
    recentSignups: signupsRes.data ?? [],
  };
});

export const getUsers = cache(async (): Promise<Profile[]> => {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
});

export const getAllExercises = cache(async (): Promise<Exercise[]> => {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .order("muscle_group")
    .order("name");

  return data ?? [];
});

export const getAllAchievements = cache(async () => {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("achievements")
    .select("*")
    .order("category")
    .order("name");

  return data ?? [];
});

export const getAuditLogs = cache(async (): Promise<AuditLog[]> => {
  await requireAdmin();
  const supabase = await createClient();

  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
});
