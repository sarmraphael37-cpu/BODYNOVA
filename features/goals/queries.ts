import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { FitnessGoal, GoalStatus } from "@/types/database";

const statusOrder: Record<GoalStatus, number> = {
  active: 0,
  paused: 1,
  completed: 2,
  abandoned: 3,
};

export const getGoals = cache(async (): Promise<FitnessGoal[]> => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("fitness_goals")
    .select("*")
    .eq("user_id", user.id);

  return (data ?? []).sort(
    (a, b) =>
      statusOrder[a.status] - statusOrder[b.status] ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
});

export const getActiveGoals = cache(async (): Promise<FitnessGoal[]> => {
  const goals = await getGoals();
  return goals.filter((goal) => goal.status === "active");
});
