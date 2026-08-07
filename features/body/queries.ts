import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/dal/auth";
import type { BodyMeasurement } from "@/types/database";

export const getBodyMeasurements = cache(
  async (limit = 60): Promise<BodyMeasurement[]> => {
    const user = await requireUser();
    const supabase = await createClient();

    const { data } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(limit);

    return data ?? [];
  }
);

export const getLatestMeasurements = cache(
  async (): Promise<BodyMeasurement | null> => {
    const entries = await getBodyMeasurements(1);
    return entries[0] ?? null;
  }
);
