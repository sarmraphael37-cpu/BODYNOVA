import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ToolIntent } from "@/features/ai-coach/lib/tools";
import { TOOL_LABELS } from "@/features/ai-coach/lib/tools";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Executes a validated tool intent against the authenticated user's own data.
 * The user id always comes from the session (passed in by the chat service),
 * never from client input.
 */
export async function executeTool(userId: string, intent: ToolIntent): Promise<string> {
  const supabase = await createClient();

  switch (intent.action) {
    case "log_water": {
      const { error } = await supabase.from("water_logs").insert({
        user_id: userId,
        date: todayIso(),
        amount_ml: intent.amountMl,
      });
      if (error) throw new Error("Couldn't save your water entry.");
      return `Done — I've added ${intent.amountMl.toLocaleString()} ml to today's hydration.`;
    }

    case "log_weight": {
      const { error } = await supabase.from("weight_entries").insert({
        user_id: userId,
        date: todayIso(),
        weight_kg: intent.weightKg,
      });
      if (error) throw new Error("Couldn't save your weight entry.");
      return `Done — I've logged your weight at ${intent.weightKg} kg for today.`;
    }

    case "open_workouts":
    case "open_hydration":
    case "open_weight":
    case "open_sleep":
    case "open_goals":
    case "view_progress":
      return `${TOOL_LABELS[intent.action]}.`;
  }
}
