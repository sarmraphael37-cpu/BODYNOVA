"use client";

import Link from "next/link";
import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/utils/format";
import type { ActiveGoal } from "@/features/dashboard/queries";

interface GoalsCardProps {
  goals: ActiveGoal[];
}

export function GoalsCard({ goals }: GoalsCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" aria-hidden />
          Active goals
        </CardTitle>
        <CardDescription>
          {goals.length > 0
            ? `${goals.length} goal${goals.length === 1 ? "" : "s"} in progress`
            : "Set a goal to track"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No active goals"
            description="Create a weight, workout, or hydration goal to see live progress here."
            className="py-10"
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/goals">Create a goal</Link>
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-1 flex-col gap-4">
            {goals.slice(0, 4).map((goal) => (
              <li key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{goal.title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {goal.current_value != null
                      ? `${formatNumber(goal.current_value)} / ${formatNumber(goal.target_value)} ${
                          goal.unit
                        }`
                      : `${formatNumber(goal.target_value)} ${goal.unit}`}
                  </span>
                </div>
                <Progress value={goal.percent} aria-label={`${goal.title} progress`} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
