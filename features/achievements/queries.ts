import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { Achievement } from "@/types/database";

export type AchievementStatus = Achievement & {
  unlocked: boolean;
  unlocked_at: string | null;
  progress_value: number | null;
};

export const getAchievements = cache(
  async (): Promise<AchievementStatus[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const [achievementsResult, unlockedResult] = await Promise.all([
      supabase.from("achievements").select("*").order("category").order("name"),
      supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at, progress_value")
        .eq("user_id", user.id),
    ]);

    const achievements = achievementsResult.data ?? [];
    if (achievementsResult.error) return [];

    const unlockedByAchievement = new Map(
      (unlockedResult.data ?? []).map((entry) => [entry.achievement_id, entry])
    );

    return achievements.map((achievement) => {
      const unlocked = unlockedByAchievement.get(achievement.id);
      return {
        ...achievement,
        unlocked: Boolean(unlocked),
        unlocked_at: unlocked?.unlocked_at ?? null,
        progress_value: unlocked?.progress_value ?? null,
      };
    });
  }
);

export const getUnlockedCount = cache(async (): Promise<number> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("user_achievements")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
});
