"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  toggleHabitLogAction,
  deleteHabitAction,
} from "@/features/habits/actions";
import type { HabitWithLogs } from "@/features/habits/queries";

interface HabitCardProps {
  habit: HabitWithLogs;
  today: string;
}

export function HabitCard({ habit, today }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const completedToday = habit.completedThisWeek.includes(today);
  const count = habit.completedThisWeek.length;
  const percent = Math.round((count / habit.target_per_week) * 100);

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleHabitLogAction(habit.id, today);
        toast.success(completedToday ? "Habit unlogged." : "Habit logged!");
      } catch {
        toast.error("Failed to update your habit.");
      }
    });
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: `${habit.color}1a`, color: habit.color }}
            >
              <Check className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold">{habit.name}</p>
              <p className="text-xs text-muted-foreground">
                {count}/{habit.target_per_week} this week
              </p>
            </div>
          </div>
          <DeleteButton action={deleteHabitAction} id={habit.id} label="Delete" />
        </div>
        <div className="mt-4 space-y-2">
          <Progress value={count} max={habit.target_per_week} />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              {percent}% of weekly target
            </span>
            <Button
              type="button"
              size="sm"
              variant={completedToday ? "secondary" : "default"}
              onClick={handleToggle}
              disabled={isPending}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              {completedToday ? "Done" : "Log today"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
