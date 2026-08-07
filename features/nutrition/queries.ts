import "server-only";
import { cache } from "react";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { NutritionEntry, NutritionFood } from "@/types/database";

export type NutritionTotals = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

export const getNutritionEntries = cache(
  async (date: string): Promise<NutritionEntry[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("created_at", { ascending: false });

    return data ?? [];
  }
);

export const getFoods = cache(
  async (search?: string): Promise<NutritionFood[]> => {
    const supabase = await createClient();

    let query = supabase
      .from("nutrition_foods")
      .select("*")
      .eq("status", "active")
      .order("name", { ascending: true })
      .limit(100);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data } = await query;
    return data ?? [];
  }
);

export const getNutritionTotals = cache(
  async (date: string): Promise<NutritionTotals> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("nutrition_entries")
      .select("calories, protein_g, carbs_g, fat_g, fiber_g")
      .eq("user_id", user.id)
      .eq("date", date);

    const totals: NutritionTotals = {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
    };

    for (const entry of data ?? []) {
      totals.calories += entry.calories;
      totals.protein_g += entry.protein_g;
      totals.carbs_g += entry.carbs_g;
      totals.fat_g += entry.fat_g;
      totals.fiber_g += entry.fiber_g;
    }

    return totals;
  }
);

export const getLastNDaysTotals = cache(
  async (days = 14): Promise<{ date: string; calories: number }[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const today = new Date();
    const start = subDays(today, days - 1);

    const { data } = await supabase
      .from("nutrition_entries")
      .select("date, calories")
      .eq("user_id", user.id)
      .gte("date", format(start, "yyyy-MM-dd"));

    const byDate: Record<string, number> = {};
    for (const entry of data ?? []) {
      byDate[entry.date] = (byDate[entry.date] ?? 0) + entry.calories;
    }

    const result: { date: string; calories: number }[] = [];
    for (let i = 0; i < days; i++) {
      const key = format(subDays(today, days - 1 - i), "yyyy-MM-dd");
      result.push({ date: key, calories: byDate[key] ?? 0 });
    }

    return result;
  }
);
