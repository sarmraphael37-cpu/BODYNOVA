import type { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getHabitsWithLogs } from "@/features/habits/queries";
import { HabitForm } from "@/features/habits/components/habit-form";
import { HabitCard } from "@/features/habits/components/habit-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { todayString } from "@/utils/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Habits",
};

export default async function HabitsPage() {
  await requireProfile();
  const habits = await getHabitsWithLogs();
  const today = todayString();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
        <p className="text-sm text-muted-foreground">
          Build small daily habits that add up over time.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 lg:col-span-2">
          {habits.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No habits yet"
              description="Create your first habit to start building consistency."
            />
          ) : (
            habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} today={today} />
            ))
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New habit</CardTitle>
          </CardHeader>
          <CardContent>
            <HabitForm />
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        Logging a habit daily builds momentum.
      </p>
    </div>
  );
}
