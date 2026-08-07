import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { createClient } from "@/lib/supabase/server";
import { WorkoutForm } from "@/features/workouts/components/workout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Exercise } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New workout",
};

export default async function NewWorkoutPage() {
  await requireProfile();
  const supabase = await createClient();

  const { data } = await supabase
    .from("exercises")
    .select("*")
    .eq("status", "active")
    .order("name", { ascending: true });

  const exercises = (data ?? []) as Exercise[];

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/app/workouts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to workouts
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New workout</h1>
        <p className="text-sm text-muted-foreground">
          Log a workout and add the exercises you performed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workout details</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkoutForm exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  );
}
